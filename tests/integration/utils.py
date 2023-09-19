from web3 import Web3


def withCustomError(customErrorString):
    errMsg = Web3.keccak(text=customErrorString)[:4].hex()
    return 'typed error: ' + errMsg


def earned(multi, account, token):
    (rewardTokens, rewardAmounts) = multi.claimableRewards(account)
    for rewardToken, rewardAmount in zip(rewardTokens, rewardAmounts):
        if (rewardToken == token):
            return rewardAmount


def exit(multi, account):
    amount = multi.userData(account)["tokenAmount"]
    unstakeTx = multi.unstake(amount, {"from": account})
    getAllRewardsTx = multi.getAllRewards({"from": account})
    return [unstakeTx, getAllRewardsTx]


def injectReward(mvault, farmingContract, rewardToken, amount, account):
    mvault.setFarmingContract(farmingContract)
    mvault.setRewardTokens([rewardToken])
    rewardToken.transfer(mvault, amount, {"from": account})

