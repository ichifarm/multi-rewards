#!/usr/bin/python3

import brownie
from brownie.test import given, strategy
from utils import withCustomError, injectReward, earned, exit

# brownie test tests/integration/test_withdraw_integration.py::test_exit

# Make sure a user who has not staked cannot withdraw
@given(amount=strategy("uint256", max_value=10 ** 25))
def test_unstaked_cannot_withdraw(multi, mvault, bob, amount):
    with brownie.reverts(withCustomError("InvalidAmount()")):
        multi.unstake(amount, {"from": bob})


# Does the amount received match up with earn?
@given(time=strategy("uint256", max_value=31557600, min_value=60))
def test_amount_received(multi, mvault, reward_token, alice, chain, time):

    mvault.stealRewards()

    rewardAmount = 10 ** 10

    injectReward(mvault, multi, reward_token, rewardAmount, alice)

    reward_token.approve(multi, 10 ** 19, {"from": alice})

    mvault.approve(multi, 10 ** 19, {"from": alice})
    multi.stake(10 ** 10, alice, {"from": alice})
    multi.stake(10 ** 10, alice, {"from": alice}) # NOTE: double stake for previously explaned reason

    chain.mine(timedelta=time)
    _earned = earned(multi, alice, reward_token)
    # reward_duration = multi.getRewardForDuration(reward_token) # NOTE: Gamma's staking contract has not concept of a reward duration
    assert rewardAmount == _earned


# Does the exit function successfully withdraw?
@given(amount=strategy("uint256", min_value=(10 ** 2), max_value=(10 ** 16)))
def test_exit(multi, mvault, reward_token, issue, alice, amount):

    multi.stake(amount, alice, {"from": alice})
    assert multi.userData(alice)["tokenAmount"] == amount

    exit(multi, alice)
    assert multi.userData(alice)["tokenAmount"] == 0
