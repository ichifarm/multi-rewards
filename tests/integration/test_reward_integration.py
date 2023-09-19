#!/usr/bin/python3

import brownie
import pytest
from brownie.test import given, strategy
from hypothesis import settings
from utils import withCustomError, injectReward, earned


# No user can modify reward
@pytest.mark.parametrize("id1", range(5))
@pytest.mark.parametrize("id2", range(5))
def test_reward_unmodifiable(multi, accounts, reward_token, id1, id2):
    with brownie.reverts():
        multi.addReward(reward_token, {"from": accounts[id2]})


# Multiple tests for calculating correct multicoin reward amounts
@given(amount1=strategy("uint256", max_value=10 ** 19, exclude=0))
@given(amount2=strategy("uint256", max_value=10 ** 19, exclude=0))
@settings(max_examples=10)
def test_multiple_reward_earnings_act(
    multi,
    reward_token,
    reward_token2,
    alice,
    bob,
    charlie,
    accounts,
    chain,
    mvault,
    amount1,
    amount2,
):
    mvault.stealRewards({"from": alice})

    precision = 10 ** 50

    reward_amount = 10 ** 10

    injectReward(mvault, multi, reward_token, reward_amount, bob)

    injectReward(mvault, multi, reward_token2, reward_amount, charlie)

    mvault.approve(multi, amount1, {"from": bob})
    multi.stake(amount1, bob, {"from": bob})

    mvault.approve(multi, amount2, {"from": charlie})
    multi.stake(amount2, charlie, {"from": charlie})

    # Check supply calculation is accurate
    assert multi.totalStakes() == amount1 + amount2
    chain.mine(timedelta=60)

    # Check reward per token calculation is accurate
    reward_per_token_stored = multi.rewardData(reward_token)["rewardPerToken"]

    # NOTE: the following calculation is not relevant to Gamma's staking contract which doesn't consider duration
    # reward_rate = reward_amount // 60
    # time_max = multi.lastTimeRewardApplicable(reward_token)
    # time_min = multi.rewardData(reward_token)["lastUpdateTime"]
    # interval = time_max - time_min
    # rpt_calc = (interval * 10 ** 18 * reward_rate) // (amount1 + amount2)
    # rpt = multi.rewardPerToken(reward_token)
    # assert reward_per_token_stored + rpt_calc == rpt

    # NOTE: this would be the expected logic for Gamma's staking contract
    rpt = reward_per_token_stored
    # only consider amount1 since charlie staked amount2 after bob
    # so bob get's all the rewards
    rpt_calc = (precision * reward_amount) // (amount1)
    assert reward_per_token_stored == rpt_calc

    # Check earning calculation is accurate
    calc_earnings = (amount1 * rpt) // precision
    act_earnings = earned(multi, bob, reward_token)
    assert calc_earnings == act_earnings

    # Account for the amount already stored
    prepaid = multi.getUserRewardPerToken(charlie, reward_token)

    calc_earnings2 = (amount2 * (rpt - prepaid)) // precision
    act_earnings2 = earned(multi, charlie, reward_token)
    assert calc_earnings2 == act_earnings2


# Reward per token accurate?
@given(amount=strategy("uint256", max_value=(10 ** 18), exclude=0))
def test_reward_per_token(multi, alice, bob, reward_token, amount, chain, mvault):

    reward_amount = 10 ** 10
    precision = 10 ** 50

    injectReward(mvault, multi, reward_token, reward_amount, alice)

    init_rpt = multi.rewardData(reward_token)["rewardPerToken"]
    assert init_rpt == 0

    mvault.approve(multi, amount, {"from": bob})
    multi.stake(amount, bob, {"from": bob})

    chain.mine(timedelta=100) # NOTE: not really needed for Gamma staking contract
    final_rpt = multi.rewardData(reward_token)["rewardPerToken"]

    assert final_rpt // precision == earned(multi, bob, reward_token)


# Rewards struct updates as expected
@given(amount=strategy("uint256", min_value=(10 ** 10), max_value=(10 ** 16), exclude=0))
def test_rewards_update(multi, alice, reward_token, amount, chain, mvault):

    injectReward(mvault, multi, reward_token, amount, alice)

    mvault.approve(multi, 100 * amount, {"from": alice})
    multi.stake(amount, alice, {"from": alice})

    rewards = []
    rewards.append(multi.rewardData(reward_token))
    chain.mine(timedelta=60)
    for i in range(1, 5):
        injectReward(mvault, multi, reward_token, amount, alice)

        multi.stake(amount, alice, {"from": alice})
        chain.mine(timedelta=60)

        rewards.append(multi.rewardData(reward_token))
        curr = rewards[i]
        last = rewards[i - 1]

        # NOTE: no concept periodFinish in Gamma staking contract
        # assert last["periodFinish"] < curr["periodFinish"]
        assert last["amount"] < curr["amount"]
        assert last["lastTimeUpdated"] < curr["lastTimeUpdated"]
        assert last["rewardPerToken"] < curr["rewardPerToken"]


# NOTE: since Gamma uses 1e50 precision instead of curve's 1e18 precision
# overflow is guaranteed unless the amounts are reduced by 1e32
@pytest.mark.parametrize("amount", [1, 1e18, 1.156e27])
def test_no_multiplication_overflow(multi, reward_token, mvault, alice, chain, amount):

    precision = 10 ** 50

    reward_token._mint_for_testing(alice, amount)
    injectReward(mvault, multi, reward_token, amount, alice)

    mvault._mint_for_testing(alice, 2 * amount)
    mvault.approve(multi, 2 * amount, {"from": alice})
    multi.stake(amount, alice, {"from": alice})
    multi.stake(amount, alice, {"from": alice}) # NOTE: double stake due to known issue where rewardData isn't updated on the very 1st stake

    chain.mine(timedelta=60) # NOTE: not needed for Gamma staking
    tot = earned(multi, alice, reward_token)

    assert tot >= (multi.rewardData(reward_token)["rewardPerToken"] // precision) * 0.99
    assert tot <= (multi.rewardData(reward_token)["rewardPerToken"] // precision) * 1.01 # TODO: investigate the point of these assertions


@pytest.mark.parametrize("amount", [1.158e59, 1e70])
def test_multiplication_overflow(multi, reward_token, mvault, alice, chain, amount):

    reward_token._mint_for_testing(alice, amount)
    injectReward(mvault, multi, reward_token, amount, alice)

    mvault._mint_for_testing(alice, amount)
    mvault.approve(multi, amount, {"from": alice})
    multi.stake(amount // 2, alice, {"from": alice})

    chain.mine(timedelta=60)
    with brownie.reverts():
        multi.stake(amount // 2, alice, {"from": alice})
        # earned(multi, alice, reward_token)
