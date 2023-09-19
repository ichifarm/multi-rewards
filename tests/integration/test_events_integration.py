#!/usr/bin/python3

from brownie.test import given, strategy
from utils import earned, injectReward

# NOTE: this test case doesn't make sense in the context of the Gamma staking contract since there is no notify reward function
# # Does the RewardAdded event fire?
# @given(_amt=strategy("uint256", max_value=(10 ** 18), exclude=0))
# def test_reward_added_fires(multi, reward_token, alice, _amt):
#     multi.stake(10 ** 18, {"from": alice})
#     reward_token.approve(multi, _amt, {"from": alice})
#     multi.setRewardsDistributor(reward_token, alice, {"from": alice})
#     tx = multi.notifyRewardAmount(reward_token, _amt, {"from": alice})

#     assert tx.events["RewardAdded"].values() == [_amt]


# Does the Staked event fire?
@given(_amt=strategy("uint256", max_value=(10 ** 18), exclude=0))
def test_staked_fires(multi, mvault, alice, _amt):
    mvault.approve(multi, _amt, {"from": alice})
    tx = multi.stake(_amt, alice, {"from": alice})
    assert tx.events["Stake"].values()[0] == alice
    assert tx.events["Stake"].values()[1] == _amt


# Does the Unstake event fire?
@given(amount=strategy("uint256", max_value=(10 ** 18), min_value=(10 ** 1), exclude=0))
def test_withdrawn_event_fires(multi, mvault, alice, amount):
    mvault.approve(multi, amount, {"from": alice})
    multi.stake(amount, alice, {"from": alice})
    tx = multi.unstake(amount // 2, {"from": alice})
    assert tx.events["Unstake"].values()[0] == alice
    assert tx.events["Unstake"].values()[1] == amount // 2


# Does the RewardPaid event fire?
@given(amount=strategy("uint256", max_value=(10 ** 18), min_value=(10 ** 2)))
def test_reward_paid_event_fires(
    multi, accounts, mvault, reward_token, chain, alice, bob, amount
):
    mvault.balanceOf(multi)

    injectReward(mvault, multi, reward_token, amount, alice)

    mvault.approve(multi, 2 * amount, {"from": bob})
    multi.stake(amount, bob, {"from": bob})
    multi.stake(amount, bob, {"from": bob}) # double stake to have rewardData update correctly

    chain.mine(timedelta=60)
    value_earned = earned(multi, bob, reward_token)
    tx = multi.getAllRewards({"from": bob})

    # there are 2 Transfer events
    # the 0th is from mvault to multi
    # the 1st is from multi to the bob
    assert tx.events[1].values()[0] == multi
    assert tx.events[1].values()[1] == bob
    assert tx.events["RewardPaid"].values()[0] == bob
    assert tx.events["RewardPaid"].values()[1] == reward_token
    assert tx.events["RewardPaid"].values()[2] == value_earned


# NOTE: this test case doesn't make sense in the context of the Gamma staking contract since there is no reward distributor
# # Does the RewardsDurationUpdated event fire?
# @given(duration=strategy("uint256", max_value=(10 ** 5), exclude=0))
# def test_rewards_duration_fires(multi, alice, reward_token, duration):
#     multi.setRewardsDistributor(reward_token, alice, {"from": alice})
#     tx = multi.setRewardsDuration(reward_token, duration, {"from": alice})
#     assert tx.events["RewardsDurationUpdated"].values()[0] == reward_token
#     assert tx.events["RewardsDurationUpdated"].values()[1] == duration


# Does the Recovered event fire?
@given(amount=strategy("uint256", max_value=(10 ** 10), exclude=0))
def test_recovered_fires(multi, alice, err_token, amount):
    tx = multi.recoverERC20(err_token, amount, {"from": alice})
    assert tx.events["Recovered"].values()[0] == err_token
    assert tx.events["Recovered"].values()[1] == amount
