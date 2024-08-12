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
  } = {
    ICHI_VAULT_FACTORY: "",
    MULTI_FEE_DISTRIBUTION_FACTORY: "",
    MULTI_FEE_DISTRIBUTION: "",
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

    // - - - - - Validate MULTI_FEE_DISTRIBUTION - - - - -
    if (!MULTI_FEE_DISTRIBUTION) {
      throw new Error(`Undefined MULTI_FEE_DISTRIBUTION`);
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

    await run("verify:verify", {
      contract: "contracts/MultiFeeDistribution.sol:MultiFeeDistribution",
      address: MULTI_FEE_DISTRIBUTION,
    });

  });

});
