from brownie import MultiFeeDistributionFactory

def main():
    mfdfAddress = "0xbb7A3d439abf42Cf39837f9102F987bab3Ee2e73"
    multi_fee_distribution_factory = MultiFeeDistributionFactory.at(mfdfAddress)
    MultiFeeDistributionFactory.publish_source(multi_fee_distribution_factory)

# brownie run verify.py --network mantle