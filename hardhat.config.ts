import 'hardhat-typechain'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import "hardhat-deploy";
require('dotenv').config()
const mnemonic = process.env.DEV_MNEMONIC || ''

export default {
  networks: {
      hardhat: {
        forking: {
         url: 'https://arbitrum-mainnet.infura.io/v3/' + process.env.INFURA_ID,
         blockNumber: 128640000
        },
        live: false,
        saveDeployments: true,
        allowUnlimitedContractSize: false,
        tags: ["test", "local"]
      },
      arbitrum: {
        url: `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_ID}`,
        accounts: [`0x${process.env.ARBITRUM_PK}`],
        chainId: 42161,
        live: true,
        saveDeployments: true,
        tags: ["arbitrum"],
        gasPrice: 120000000,
        //gasMultiplier: 2,
      },
      mainnet: {
        url: 'https://arbitrum-mainnet.infura.io/v3/' + process.env.INFURA_ID,
        accounts: {
          mnemonic,
        },
      }
  },
  namedAccounts: {
    deployer: 0,
  },
  watcher: {
      compilation: {
          tasks: ["compile"],
      }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  etherscan: {
    apiKey: process.env.ARBISCAN_APIKEY,
  },
  mocha: {
    timeout: 2000000
  }
}
