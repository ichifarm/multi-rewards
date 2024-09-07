import { ethers, network, run } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// For more details on programmatic verification in hardhat see:
// https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify#using-programmatically
describe("Verify All Contracts via Etherscan", async function () {

  const isHardhat = network.name === "hardhat";

  const requisiteData: {
    ICHI_VAULT_FACTORY?: string;
    MULTI_FEE_DISTRIBUTION_FACTORY?: string;
    MULTI_FEE_DISTRIBUTION?: string;
    REWARD_CAMPAIGN_DISTRIBUTOR_FACTORY?: string;
    REWARD_CAMPAIGN_DISTRIBUTOR_IMPLEMENTATION?: string;
    REWARD_CAMPAIGN_DISTRIBUTOR?: string;
  } = {
    ICHI_VAULT_FACTORY: "",
    MULTI_FEE_DISTRIBUTION_FACTORY: "",
    MULTI_FEE_DISTRIBUTION: "",
    REWARD_CAMPAIGN_DISTRIBUTOR_FACTORY: "",
    REWARD_CAMPAIGN_DISTRIBUTOR_IMPLEMENTATION: "",
    REWARD_CAMPAIGN_DISTRIBUTOR: "",
  };

  let deployer: SignerWithAddress, governor: SignerWithAddress, lp: SignerWithAddress;

  before(async () => {

    if (isHardhat) {
      throw new Error(`To verify on a specific etherscan(not hardhat) specify "--network" cmd flag`);
    }

    const signers = await ethers.getSigners();
    [deployer, governor, lp,] = signers;

    // validate all requisite data and populate requisite data in allData before attempting to proceed with steps

    const {
      ICHI_VAULT_FACTORY,
      MULTI_FEE_DISTRIBUTION_FACTORY,
      MULTI_FEE_DISTRIBUTION,
    } = requisiteData;

    // - - - - - Validate ICHI_VAULT_FACTORY - - - - -
    if (!ICHI_VAULT_FACTORY) {
      throw new Error(`Undefined ICHI_VAULT_FACTORY`);
    }

    // - - - - - Validate MULTI_FEE_DISTRIBUTION_FACTORY - - - - -
    if (!MULTI_FEE_DISTRIBUTION_FACTORY) {
      throw new Error(`Undefined MULTI_FEE_DISTRIBUTION_FACTORY`);
    }

  });

  after(async () => {
    console.log("requisiteData:", requisiteData);
  });

  let shouldSkip = false;
  beforeEach(function () {
    if (shouldSkip) {
      this.skip();
    }
  });

  // afterEach(function () {
  //   if (this.currentTest?.state === 'failed') {
  //     shouldSkip = true;
  //   }
  // });

  it("should verify MultiFeeDistributionFactory", async () => {

    const {
      MULTI_FEE_DISTRIBUTION_FACTORY,
      ICHI_VAULT_FACTORY,
    } = requisiteData;

    await run("verify:verify", {
      contract: "contracts/MultiFeeDistributionFactory.sol:MultiFeeDistributionFactory",
      address: MULTI_FEE_DISTRIBUTION_FACTORY,
      constructorArguments: [
        ICHI_VAULT_FACTORY,
      ],
    });

  });

  it("should verify MultiFeeDistribution", async () => {

    const {
      MULTI_FEE_DISTRIBUTION
    } = requisiteData;

    if (MULTI_FEE_DISTRIBUTION) {
      await run("verify:verify", {
        contract: "contracts/MultiFeeDistribution.sol:MultiFeeDistribution",
        address: MULTI_FEE_DISTRIBUTION,
      });
    }

  });

  it("should verify RewardCampaignDistributorFactory", async () => {

    const {
      MULTI_FEE_DISTRIBUTION_FACTORY,
      REWARD_CAMPAIGN_DISTRIBUTOR_IMPLEMENTATION,
    } = requisiteData;

    await run("verify:verify", {
      contract: "contracts/RewardCampaignDistributorFactory.sol:RewardCampaignDistributorFactory",
      address: MULTI_FEE_DISTRIBUTION_FACTORY,
      constructorArguments: [
        REWARD_CAMPAIGN_DISTRIBUTOR_IMPLEMENTATION,
      ],
    });

  });

  it("should verify RewardCampaignDistributor Implementation", async () => {

    const {
      REWARD_CAMPAIGN_DISTRIBUTOR_IMPLEMENTATION
    } = requisiteData;

    if (REWARD_CAMPAIGN_DISTRIBUTOR_IMPLEMENTATION) {
      await run("verify:verify", {
        contract: "contracts/RewardCampaignDistributor.sol:RewardCampaignDistributor",
        address: REWARD_CAMPAIGN_DISTRIBUTOR_IMPLEMENTATION,
      });
    }

  });

  it("should verify RewardCampaignDistributor", async () => {

    const {
      REWARD_CAMPAIGN_DISTRIBUTOR
    } = requisiteData;

    if (REWARD_CAMPAIGN_DISTRIBUTOR) {
      await run("verify:verify", {
        contract: "contracts/RewardCampaignDistributor.sol:RewardCampaignDistributor",
        address: REWARD_CAMPAIGN_DISTRIBUTOR,
      });
    }

  });

});
