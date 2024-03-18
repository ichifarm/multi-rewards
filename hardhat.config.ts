import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import { config as dotenvConfig } from "dotenv";
import "hardhat-deploy";
import type { HardhatUserConfig } from "hardhat/config";
import type { NetworkUserConfig } from "hardhat/types";
import { resolve } from "path";

import { SupportedChainId, isValidChainId } from "./test/shared/chains";

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({ path: resolve(__dirname, dotenvConfigPath) });

// Ensure that we have all the environment variables we need.
const mnemonic: string | undefined = process.env.MNEMONIC;

if (!mnemonic) {
  throw new Error("Please set your PKs or MNEMONIC in a .env file");
}

const infuraApiKey: string | undefined = process.env.INFURA_API_KEY;
if (!infuraApiKey) {
  throw new Error("Please set your INFURA_API_KEY in a .env file");
}

const CHAIN_ID = process.env.CHAIN_ID ? parseInt(process.env.CHAIN_ID) : undefined;
const DEX = process.env.DEX;

if (!isValidChainId(CHAIN_ID)) {
  throw new Error(`CHAIN_ID ${CHAIN_ID} is not supported`);
}

const forkChain: SupportedChainId = CHAIN_ID;

const chainNames: Record<SupportedChainId, string> = {
  [SupportedChainId.ETHEREUM_MAINNET]: "mainnet",
  [SupportedChainId.OPTIMISM_MAINNET]: "optimism-mainnet",
  [SupportedChainId.BSC_MAINNET]: "bsc",
  [SupportedChainId.POLYGON_MAINNET]: "polygon-mainnet",
  [SupportedChainId.OPBNB_MAINNET]: "opbnb-mainnet",
  [SupportedChainId.FANTOM_MAINNET]: "fantom-mainnet",
  [SupportedChainId.HEDERA_MAINNET]: "hedera-mainnet",
  [SupportedChainId.HEDERA_TESTNET]: "hedera-testnet",
  [SupportedChainId.POLYGON_ZKEVM]: "polygon-zkevm",
  [SupportedChainId.GANACHE]: "ganache",
  [SupportedChainId.MANTLE_MAINNET]: "mantle-mainnet",
  [SupportedChainId.EVMOS_MAINNET]: "evmos-mainnet",
  [SupportedChainId.HARDHAT]: "hardhat",
  [SupportedChainId.AVALANCHE_MAINNET]: "avalanche-mainnet",
  [SupportedChainId.SEPOLIA]: "sepolia",
  [SupportedChainId.ARBITRUM_MAINNET]: "arbitrum-mainnet",
  [SupportedChainId.POLYGON_MUMBAI]: "polygon-mumbai",
  [SupportedChainId.LINEA_MAINNET]: "linea-mainnet",
  [SupportedChainId.HORIZEN_MAINNET]: "horizen-mainnet",
  [SupportedChainId.BASE_MAINNET]: "base-mainnet",
  [SupportedChainId.ZKSYNC_TESTNET]: "zksync-testnet",
  [SupportedChainId.ZKSYNC_MAINNET]: "zksync-mainnet",
};

function getAccounts() {
  if (mnemonic) {
    const accounts = {
      count: 10,
      mnemonic,
      path: "m/44'/60'/0'/0",
    };
    return accounts;
  }
  throw new Error("Either mnemonic or PKs should be defined");
}

// NOTE: we mostly don't care fast fork tests from caching
const forkBlockNumbers: Partial<Record<SupportedChainId, number>> = {
  // [SupportedChainId.BSC_MAINNET]: 34_274_774,
  // [SupportedChainId.HEDERA_TESTNET]: 4_900_000,
  // [SupportedChainId.HORIZEN_MAINNET]: 677_000,
  // [SupportedChainId.ZKSYNC_TESTNET]: 14_621_693,
  // [SupportedChainId.ZKSYNC_MAINNET]: 21_240_546,
  // [SupportedChainId.ARBITRUM_MAINNET]: 169_388_000,
  // [SupportedChainId.ETHEREUM_MAINNET]: 19_225_400,
  // [SupportedChainId.AVALANCHE_MAINNET]: 41_672_600,
  // [SupportedChainId.MANTLE_MAINNET]: 55_010_000,
  // [SupportedChainId.BASE_MAINNET]: 10_607_880,
};

// If a block number to pin a fork for a given network isn't specified then "latest" will be used for the fork by default(i.e. if undefined is returned)
function getForkChainBlockNumber(chainId: SupportedChainId): number | undefined {
  return forkBlockNumbers[chainId];
}

const fallbackRpcUrls: Record<SupportedChainId, string[]> = {
  [SupportedChainId.ETHEREUM_MAINNET]: ["https://eth.llamarpc.com"],
  [SupportedChainId.OPTIMISM_MAINNET]: ["https://optimism.llamarpc.com"],
  [SupportedChainId.BSC_MAINNET]: ["https://rpc.ankr.com/bsc"],
  [SupportedChainId.POLYGON_MAINNET]: ["https://polygon.llamarpc.com"],
  [SupportedChainId.OPBNB_MAINNET]: ["https://opbnb.publicnode.com"],
  [SupportedChainId.FANTOM_MAINNET]: [
    "https://rpc.fantom.network",
    "https://rpcapi.fantom.network",
    "https://fantom-pokt.nodies.app",
    "https://rpc.ftm.tools",
    "https://rpc.ankr.com/fantom",
    "https://rpc2.fantom.network",
    "https://rpc3.fantom.network",
    "https://fantom-mainnet.public.blastapi.io",
    "https://endpoints.omniatech.io/v1/fantom/mainnet/public",
  ],
  [SupportedChainId.HEDERA_MAINNET]: ["https://mainnet.hashio.io/api"],
  [SupportedChainId.HEDERA_TESTNET]: ["https://testnet.hashio.io/api"],
  [SupportedChainId.POLYGON_ZKEVM]: ["https://rpc.ankr.com/polygon_zkevm"],
  [SupportedChainId.GANACHE]: ["http://localhost:8545"],
  [SupportedChainId.MANTLE_MAINNET]: [
    "https://1rpc.io/mantle",
    "https://rpc.mantle.xyz",
    "https://mantle.drpc.org",
    "https://mantle-mainnet.public.blastapi.io",
    "https://mantle.publicnode.com",
    "https://rpc.ankr.com/mantle",
  ],
  [SupportedChainId.EVMOS_MAINNET]: [
    "https://evmos-evm.publicnode.com",
    "https://evmos.lava.build",
    "https://jsonrpc-evmos.mzonder.com",
    "https://json-rpc.evmos.tcnetwork.io",
    "https://rpc-evm.evmos.dragonstake.io",
    "https://evmos-jsonrpc.alkadeta.com",
    "https://evmos-jsonrpc.stake-town.com",
    "https://evm-rpc.evmos.silentvalidator.com",
    "https://evmos-mainnet.public.blastapi.io",
    "https://jsonrpc-evmos-ia.cosmosia.notional.ventures",
    "https://evmos-jsonrpc.theamsolutions.info",
    "https://alphab.ai/rpc/eth/evmos",
    "https://evmos-json-rpc.0base.dev",
    "https://json-rpc-evmos.mainnet.validatrium.club",
    "https://evmos-json-rpc.stakely.io",
    "https://json-rpc.evmos.blockhunters.org",
    "https://evmos-pokt.nodies.app",
    "https://evmosevm.rpc.stakin-nodes.com",
    "https://evmos-json.antrixy.org",
  ],
  [SupportedChainId.HARDHAT]: [""],
  [SupportedChainId.AVALANCHE_MAINNET]: [
    "https://avalanche-mainnet-rpc.allthatnode.com",
    "https://rpc.ankr.com/avalanche",
    "https://1rpc.io/avax/c",
    "https://api.avax.network/ext/bc/C/rpc",
    "https://avalanche.public-rpc.com",
    "https://avalanche-c-chain.publicnode.com",
    "https://avalanche.blockpi.network/v1/rpc/public",
    "https://avalanche.drpc.org",
  ],
  [SupportedChainId.SEPOLIA]: ["https://1rpc.io/sepolia"],
  [SupportedChainId.ARBITRUM_MAINNET]: ["https://arbitrum.llamarpc.com"],
  [SupportedChainId.POLYGON_MUMBAI]: ["https://polygon-testnet.public.blastapi.io"],
  [SupportedChainId.LINEA_MAINNET]: ["https://linea.drpc.org"],
  [SupportedChainId.HORIZEN_MAINNET]: ["https://rpc.ankr.com/horizen_eon"],
  [SupportedChainId.BASE_MAINNET]: [
    "https://mainnet.base.org",
    "https://base.blockpi.network/v1/rpc/public",
    "https://1rpc.io/base",
    "https://base-pokt.nodies.app",
    "https://base.meowrpc.com",
    "https://base-mainnet.public.blastapi.io",
    "https://base.gateway.tenderly.co",
    "https://gateway.tenderly.co/public/base",
    "https://rpc.notadegen.com/base",
    "https://base.publicnode.com",
    "https://base.drpc.org",
    "https://endpoints.omniatech.io/v1/base/mainnet/public",
    "https://base.llamarpc.com",
  ],
  [SupportedChainId.ZKSYNC_TESTNET]: ["https://sepolia.era.zksync.dev"],
  [SupportedChainId.ZKSYNC_MAINNET]: ["https://mainnet.era.zksync.io"],
};

const defaultRpcUrls: Record<SupportedChainId, string> = {
  [SupportedChainId.ETHEREUM_MAINNET]: fallbackRpcUrls[SupportedChainId.ETHEREUM_MAINNET][0],
  [SupportedChainId.OPTIMISM_MAINNET]: fallbackRpcUrls[SupportedChainId.OPTIMISM_MAINNET][0],
  [SupportedChainId.BSC_MAINNET]: fallbackRpcUrls[SupportedChainId.BSC_MAINNET][0],
  [SupportedChainId.POLYGON_MAINNET]: fallbackRpcUrls[SupportedChainId.POLYGON_MAINNET][0],
  [SupportedChainId.OPBNB_MAINNET]: fallbackRpcUrls[SupportedChainId.OPBNB_MAINNET][0],
  [SupportedChainId.FANTOM_MAINNET]: fallbackRpcUrls[SupportedChainId.FANTOM_MAINNET][0],
  [SupportedChainId.HEDERA_MAINNET]: fallbackRpcUrls[SupportedChainId.HEDERA_MAINNET][0],
  [SupportedChainId.HEDERA_TESTNET]: fallbackRpcUrls[SupportedChainId.HEDERA_TESTNET][0],
  [SupportedChainId.POLYGON_ZKEVM]: fallbackRpcUrls[SupportedChainId.POLYGON_ZKEVM][0],
  [SupportedChainId.GANACHE]: fallbackRpcUrls[SupportedChainId.GANACHE][0],
  [SupportedChainId.MANTLE_MAINNET]: fallbackRpcUrls[SupportedChainId.MANTLE_MAINNET][0],
  [SupportedChainId.EVMOS_MAINNET]: fallbackRpcUrls[SupportedChainId.EVMOS_MAINNET][0],
  [SupportedChainId.HARDHAT]: fallbackRpcUrls[SupportedChainId.HARDHAT][0],
  [SupportedChainId.AVALANCHE_MAINNET]: fallbackRpcUrls[SupportedChainId.AVALANCHE_MAINNET][0],
  [SupportedChainId.SEPOLIA]: fallbackRpcUrls[SupportedChainId.SEPOLIA][0],
  [SupportedChainId.ARBITRUM_MAINNET]: fallbackRpcUrls[SupportedChainId.ARBITRUM_MAINNET][0],
  [SupportedChainId.POLYGON_MUMBAI]: fallbackRpcUrls[SupportedChainId.POLYGON_MUMBAI][0],
  [SupportedChainId.LINEA_MAINNET]: fallbackRpcUrls[SupportedChainId.LINEA_MAINNET][0],
  [SupportedChainId.HORIZEN_MAINNET]: fallbackRpcUrls[SupportedChainId.HORIZEN_MAINNET][0],
  [SupportedChainId.BASE_MAINNET]: fallbackRpcUrls[SupportedChainId.BASE_MAINNET][0],
  [SupportedChainId.ZKSYNC_TESTNET]: fallbackRpcUrls[SupportedChainId.ZKSYNC_TESTNET][0],
  [SupportedChainId.ZKSYNC_MAINNET]: fallbackRpcUrls[SupportedChainId.ZKSYNC_MAINNET][0],
};

const infuraSupportedNetworks: Partial<Record<SupportedChainId, boolean>> = {
  [SupportedChainId.ETHEREUM_MAINNET]: true,
  [SupportedChainId.BASE_MAINNET]: false,
  [SupportedChainId.POLYGON_MAINNET]: true,
  [SupportedChainId.OPTIMISM_MAINNET]: true,
  [SupportedChainId.ARBITRUM_MAINNET]: true,
  [SupportedChainId.AVALANCHE_MAINNET]: true,
};

function getChainUrl(chainId: SupportedChainId): string {
  // Check if the chainId has a custom URL in infuraSupportedNetworks
  if (infuraSupportedNetworks[chainId]) {
    return `https://${chainNames[chainId]}.infura.io/v3/${infuraApiKey}`;
  }

  return defaultRpcUrls[chainId];
}

function getChainConfig(chainId: SupportedChainId): NetworkUserConfig {
  const jsonRpcUrl = getChainUrl(chainId);

  return {
    accounts: getAccounts(),
    chainId,
    url: jsonRpcUrl,
    timeout: 60_000, // added as the default timeout isn't sufficient for Hedera
  };
}

const chainConfigs = Object.entries(chainNames).reduce((config, [chainIdString, chainName]) => {
  const chainId = Number(chainIdString);
  if (isValidChainId(chainId)) {
    config[chainName] = getChainConfig(chainId);
    return config;
  } else {
    throw new Error("Invalid chainId");
  }
}, {} as Record<string, ReturnType<typeof getChainConfig>>);

function getForkChainConfig(chain: SupportedChainId): {
  url: string;
  blockNumber?: number;
} {
  const jsonRpcUrl = getChainUrl(chain);
  const blockNumber = getForkChainBlockNumber(chain);

  return {
    url: jsonRpcUrl,
    blockNumber,
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: 0,
    governor: 1,
    lp: 2,
  },
  etherscan: {
    apiKey: {
      arbitrumOne: process.env.ARBISCAN_API_KEY || "",
      avalanche: process.env.SNOWTRACE_API_KEY || "",
      bsc: process.env.BSCSCAN_API_KEY || "",
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      optimisticEthereum: process.env.OPTIMISM_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      evmos: process.env.ESCAN_API_KEY || "",
      mantle: process.env.MANTLE_API_KEY || "",
    },
    customChains: [
      {
        chainId: 9001,
        network: "evmos",
        urls: {
          apiURL: "https://escan.live/api",
          browserURL: "https://escan.live"
        }
      },
      {
        network: "mantle",
        chainId: 5000,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/mainnet/evm/5000/etherscan",
          browserURL: "https://mantlescan.info"
        }
      },
    ]
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    ...chainConfigs,
    // NOTE: chainConfigs is destructed before "hardhat" and "ganache" below so as to not overwrite the configs below
    hardhat: {
      forking: forkChain ? getForkChainConfig(forkChain) : undefined,
      chainId: forkChain ? forkChain : SupportedChainId.HARDHAT,
      accounts: {
        mnemonic,
      },
    },
    ganache: {
      accounts: getAccounts(),
      chainId: SupportedChainId.GANACHE,
      url: "http://localhost:8545",
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
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
  typechain: {
    outDir: "types",
    // target: "ethers-v6",
  },
  mocha: {
    timeout: 3600_000, // 1 hour
  },
};

export default config;
