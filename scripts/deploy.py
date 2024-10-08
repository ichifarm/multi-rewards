from brownie import MultiFeeDistribution, accounts
from brownie.network.gas.strategies import GasNowScalingStrategy

# the address that will be used to deploy the contract
# can be loaded via a keystore or private key, for more info see
# https://eth-brownie.readthedocs.io/en/stable/account-management.html
DEPLOYER = accounts.add()

# the address that owns the contract and can call all restricted functions
OWNER = DEPLOYER

# the address of the Curve LP token for your pool
STAKING_TOKEN_ADDRESS = "0x"

gas_strategy = GasNowScalingStrategy("standard", "fast")


def main():
    multi_fee_distribution = MultiFeeDistribution.deploy(
        OWNER, STAKING_TOKEN_ADDRESS, {"from": DEPLOYER, "gas_price": gas_strategy}
    )

    print(
        f"""Success!
MultiFeeDistribution deployed to: {multi_fee_distribution}
Owner: {OWNER}
Please verify the source code here: https://etherscan.io/verifyContract?a={multi_fee_distribution}
Compiler version: 0.5.17
Optimization: ON
"""
    )
