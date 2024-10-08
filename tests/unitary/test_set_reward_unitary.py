#!/usr/bin/python3

import brownie
from utils import withCustomError


# NOTE: this test case doesn't make sense in the context of Gamma's staking contract as there is not reward distributor
# # Was Reward Token 1 instantiated to Bob?
# def test_reward_added(multi, accounts, reward_token, bob):
#     assert multi.rewardData(reward_token)[0] == bob


# NOTE: this test case doesn't make sense in the context of Gamma's staking contract as there is not reward distributor
# # Was Reward Token 1 instantiated to Charlie?
# def test_reward2_added(multi, accounts, reward_token2, charlie):
#     assert multi.rewardData(reward_token2)[0] == charlie


# Owner cannot re-add a reward token
def test_owner_cannot_modify_reward(multi, reward_token, alice):
    with brownie.reverts(withCustomError("ActiveReward()")):
        multi.addReward(reward_token, {"from": alice})


# NOTE: this test case doesn't make sense in the context of Gamma's staking contract as there is not reward distributor
# # Can distributor set reward?
# def test_set_rewards_distributor(multi, reward_token, alice, bob):
#     multi.setRewardsDistributor(reward_token, bob, {"from": alice})
#     assert multi.rewardData(reward_token)[0] == bob


# NOTE: this test case doesn't make sense in the context of Gamma's staking contract as there is not reward notification function for the owner to inject rewards
# # Are owners able to update reward notification?
# def test_owner_notify_reward_amount(multi, reward_token, alice):
#     reward_token.approve(multi, 10 ** 19, {"from": alice})
#     multi.setRewardsDistributor(reward_token, alice, {"from": alice})
#     multi.notifyRewardAmount(reward_token, 10 ** 10, {"from": alice})
#     assert multi.getRewardForDuration(reward_token) > 0


# NOTE: this test case doesn't make sense in the context of Gamma's staking contract as there is not reward notification function for the owner to inject rewards
# # Unassigned owner able to update reward notification?
# def test_unassigned_owner_cannot_update(multi, reward_token, alice, bob):
#     reward_token.approve(multi, 10 ** 19, {"from": alice})
#     multi.setRewardsDistributor(reward_token, bob, {"from": alice})
#     with brownie.reverts():
#         multi.notifyRewardAmount(reward_token, 10 ** 10, {"from": alice})


# NOTE: this test case doesn't make sense in the context of Gamma's staking contract as there is not reward notification function for the owner to inject rewards
# # Random users should not be able to access notifyRewardAmount
# def test_rando_notify_reward_amount(multi, reward_token, alice, bob, charlie):
#     multi.setRewardsDistributor(reward_token, bob, {"from": alice})
#     with brownie.reverts():
#         multi.notifyRewardAmount(reward_token, 10 ** 10, {"from": charlie})


# NOTE: this test case doesn't make sense in the context of Gamma's staking contract as there is not reward distributor
# # Ex-distributor should not be able to set
# def test_ex_distributor_cannot_set(multi, reward_token, alice, bob, charlie):
#     multi.setRewardsDistributor(reward_token, charlie, {"from": alice})
#     multi.setRewardsDistributor(reward_token, bob, {"from": alice})
#     with brownie.reverts():
#         multi.notifyRewardAmount(reward_token, 10 ** 10, {"from": charlie})


# NOTE: this test case doesn't make sense in the context of Gamma's staking contract as there is not reward distributor
# # Users cannot cross-pollinate?
# def test_cannot_update_other_tokens(multi, reward_token, reward_token2, alice, bob, charlie):
#     multi.setRewardsDistributor(reward_token, bob, {"from": alice})
#     multi.setRewardsDistributor(reward_token2, charlie, {"from": alice})

#     assert multi.rewardData(reward_token)["rewardsDistributor"] == bob
#     assert multi.rewardData(reward_token2)["rewardsDistributor"] == charlie

#     with brownie.reverts():
#         multi.notifyRewardAmount(reward_token, 10 ** 10, {"from": alice})
#     with brownie.reverts():
#         multi.notifyRewardAmount(reward_token, 10 ** 10, {"from": charlie})


# NOTE: this test case doesn't make sense in the context of Gamma's staking contract as there is not reward notification function for the owner to inject rewards
# # Cannot call notifyRewardAmount without Distributor set
# def test_notify_without_distributor(multi, reward_token, alice):
#     with brownie.reverts():
#         multi.notifyRewardAmount(reward_token, 10 ** 10, {"from": alice})


# NOTE: this test case doesn't make sense in the context of Gamma's staking contract as there is not reward notification function for the owner to inject rewards
# and also no concept of a periodFinish
# # Check block.timestamp before periodFinish
# def test_notify_reward_before_period_finish(multi, reward_token, alice, chain):
#     reward_token.approve(multi, 10 ** 19, {"from": alice})
#     multi.setRewardsDistributor(reward_token, alice, {"from": alice})
#     multi.notifyRewardAmount(reward_token, 10 ** 15, {"from": alice})

#     # Initial rate is set
#     initial_rate = 10 ** 15 // 60
#     assert multi.rewardData(reward_token)["rewardRate"] == initial_rate

#     # Within duration, update reward
#     multi.notifyRewardAmount(reward_token, 10 ** 15, {"from": alice})
#     assert multi.rewardData(reward_token)["rewardRate"] > initial_rate

#     # Wait for duration to expire
#     chain.mine(timedelta=1000)
#     multi.notifyRewardAmount(reward_token, 10 ** 15, {"from": alice})
#     assert multi.rewardData(reward_token)["rewardRate"] == initial_rate

#     reward_token.approve(multi, 10 ** 19, {"from": alice})
#     multi.setRewardsDistributor(reward_token, alice, {"from": alice})
#     multi.notifyRewardAmount(reward_token, 10 ** 15, {"from": alice})
#     with brownie.reverts("Reward period still active"):
#         multi.setRewardsDuration(reward_token, 9999999, {"from": alice})


# Does reward per token update?
def test_reward_per_token_updates(multi, reward_token, alice, bob, mvault, issue, chain):
    amount = 10 ** 10

    mvault.approve(multi, amount, {"from": bob})
    multi.stake(amount, bob, {"from": bob})
    chain.mine(timedelta=100)

    # NOTE: for some reason Gamma does not update the rewardData on the very 1st stake(), hence a 2nd stake is required to trigger this update
    mvault.approve(multi, amount, {"from": alice})
    multi.stake(amount, alice, {"from": alice})
    chain.mine(timedelta=100)

    assert multi.rewardData(reward_token)["rewardPerToken"] > 0


# NOTE: this test case doesn't make sense in the context of Gamma's staking contract as there is not reward notification function for the owner to inject rewards
# # Does correct balance transfer on reward set?
# def test_reward_creation_transfers_balance(multi, reward_token, alice):
#     amount = reward_token.balanceOf(alice)
#     reward_token.approve(multi, amount, {"from": alice})
#     multi.setRewardsDistributor(reward_token, alice, {"from": alice})
#     multi.rewardData(reward_token)
#     multi.notifyRewardAmount(reward_token, amount, {"from": alice})
#     assert reward_token.balanceOf(alice) == 0
#     assert multi.rewardData(reward_token)["rewardRate"] == amount // 60


# NOTE: this test case doesn't make sense in the context of Gamma's staking contract as there is not reward notification function for the owner to inject rewards
# # Fail on insufficient balance
# def test_reward_fail_on_insufficient_balance(multi, reward_token, alice):
#     amount = 10 ** 30
#     reward_token.approve(multi, amount, {"from": alice})
#     multi.setRewardsDistributor(reward_token, alice, {"from": alice})
#     with brownie.reverts():
#         multi.notifyRewardAmount(reward_token, amount, {"from": alice})

# NOTE: this test case doesn't make sense in the context of Gamma's staking contract as there is not concept of a reward duration
# # Reward per duration accurate?  Should round off and return full amount
# def test_reward_per_duration(multi, reward_token, alice):
#     amount = 10 ** 15
#     reward_token.approve(multi, amount, {"from": alice})
#     multi.setRewardsDistributor(reward_token, alice, {"from": alice})
#     multi.notifyRewardAmount(reward_token, amount, {"from": alice})
#     multi.getRewardForDuration(reward_token) == amount // 60 * 60


# NOTE: this test case doesn't make sense in the context of Gamma's staking contract as there is not concept of lastTimeRewardApplicable
# # Does last reward time update?
# def test_last_time_reward_applicable(multi, reward_token, chain, alice):
#     amount = 10 ** 15

#     reward_token.approve(multi, amount, {"from": alice})
#     multi.setRewardsDistributor(reward_token, alice, {"from": alice})
#     last_time = multi.lastTimeRewardApplicable(reward_token)
#     for i in range(5):
#         reward_token.approve(multi, amount, {"from": alice})
#         multi.notifyRewardAmount(reward_token, amount, {"from": alice})
#         chain.mine(timedelta=60)
#         curr_time = multi.lastTimeRewardApplicable(reward_token)
#         assert curr_time > last_time
#         last_time = curr_time


# NOTE: this test case doesn't make sense in the context of Gamma's staking contract as there is not concept of a reward duration
# def test_cannot_set_duration_zero(multi, reward_token, alice, chain):
#     reward_token.approve(multi, 10 ** 19, {"from": alice})
#     multi.setRewardsDistributor(reward_token, alice, {"from": alice})
#     multi.notifyRewardAmount(reward_token, 10 ** 15, {"from": alice})
#     chain.mine(timedelta=100)
#     with brownie.reverts("Reward duration must be non-zero"):
#         multi.setRewardsDuration(reward_token, 0, {"from": alice})


# def test_rewards_division_by_zero(multi, reward_token, alice, chain):
#    reward_token.approve(multi, 10 ** 19, {"from": alice})
#    multi.setRewardsDistributor(reward_token, alice, {"from": alice})
#    multi.notifyRewardAmount(reward_token, 10 ** 15, {"from": alice})
#    chain.mine(timedelta=100)
#    multi.setRewardsDuration(reward_token, 0, {"from": alice})
#    assert multi.rewardData(reward_token)["rewardsDuration"] == 0
#    with brownie.reverts("SafeMath: division by zero"):
#        multi.notifyRewardAmount(reward_token, 0)
