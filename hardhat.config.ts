import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import "@nomiclabs/hardhat-etherscan";
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
  throw new Error("Please set your MNEMONIC in a .env file");
}

const infuraApiKey: string | undefined = process.env.INFURA_API_KEY;
if (!infuraApiKey) {
  throw new Error("Please set your INFURA_API_KEY in a .env file");
}

// NOTE: attempting to verify from the cli prgrammatically with npx hardhat verify won't work
// since this config overrides some of the default supported verify networks
// Hence you would verify programmatically with the verify.spec.ts script
const chainNames: Record<SupportedChainId, string> = {
  [SupportedChainId.ETHEREUM_MAINNET]: "mainnet",
  [SupportedChainId.OPTIMISM_MAINNET]: "optimism-mainnet",
  [SupportedChainId.BSC_MAINNET]: "bsc",
  [SupportedChainId.POLYGON_MAINNET]: "polygon-mainnet",
  [SupportedChainId.OPBNB_MAINNET]: "opbnb-mainnet",
  [SupportedChainId.FANTOM_MAINNET]: "fantom-mainnet",
  [SupportedChainId.FANTOM_TESTNET]: "fantom-testnet",
  [SupportedChainId.FANTOM_SONIC]: "fantom-sonic",
  [SupportedChainId.HEDERA_MAINNET]: "hedera-mainnet",
  [SupportedChainId.HEDERA_TESTNET]: "hedera-testnet",
  [SupportedChainId.POLYGON_ZKEVM]: "polygon-zkevm",
  [SupportedChainId.GANACHE]: "ganache",
  [SupportedChainId.MANTLE_MAINNET]: "mantle-mainnet",
  [SupportedChainId.EVMOS_MAINNET]: "evmos-mainnet",
  [SupportedChainId.ARTHERA_MAINNET]: "arthera-mainnet",
  [SupportedChainId.ARTHERA_TESTNET]: "arthera-testnet",
  [SupportedChainId.UNREAL]: "unreal",
  [SupportedChainId.REAL]: "real",
  [SupportedChainId.HARDHAT]: "hardhat",
  [SupportedChainId.AVALANCHE_MAINNET]: "avalanche-mainnet",
  [SupportedChainId.SEPOLIA]: "sepolia",
  [SupportedChainId.ARBITRUM_MAINNET]: "arbitrum-mainnet",
  [SupportedChainId.POLYGON_MUMBAI]: "polygon-mumbai",
  [SupportedChainId.BLAST_MAINNET]: "blast-mainnet",
  [SupportedChainId.TAIKO_HEKLA]: "taiko-hekla",
  [SupportedChainId.SCROLL_MAINNET]: "scroll-mainnet",
  [SupportedChainId.LINEA_MAINNET]: "linea-mainnet",
  [SupportedChainId.HORIZEN_MAINNET]: "horizen-mainnet",
  [SupportedChainId.BASE_MAINNET]: "base-mainnet",
  [SupportedChainId.ZKSYNC_TESTNET]: "zksync-testnet",
  [SupportedChainId.ZKSYNC_MAINNET]: "zksync-mainnet",
  [SupportedChainId.BLAST_SEPOLIA]: "blast-sepolia",
  [SupportedChainId.X1_TESTNET]: "x1-testnet",
  [SupportedChainId.CELO_MAINNET]: "celo-mainnet",
  [SupportedChainId.KAVA_MAINNET]: "kava-mainnet",
};

const fallbackRpcUrls: Record<SupportedChainId, string[]> = {
  [SupportedChainId.ETHEREUM_MAINNET]: [
    "https://eth.llamarpc.com"
  ],
  [SupportedChainId.OPTIMISM_MAINNET]: [
    "https://optimism.llamarpc.com"
  ],
  [SupportedChainId.BSC_MAINNET]: [
    "https://bsc-dataseed.bnbchain.org",
    "https://getblock.io/nodes/bsc",
    "https://binance.llamarpc.com",
    "https://rpc.ankr.com/bsc",
    "https://bsc-dataseed1.defibit.io",
    "https://bsc-dataseed1.ninicoin.io",
    "https://bsc-dataseed2.defibit.io",
    "https://bsc-dataseed3.defibit.io",
    "https://bsc-dataseed4.defibit.io",
    "https://bsc-dataseed2.ninicoin.io",
    "https://bsc-dataseed3.ninicoin.io",
    "https://bsc-dataseed4.ninicoin.io",
    "https://bsc-dataseed1.bnbchain.org",
    "https://bsc-dataseed2.bnbchain.org",
    "https://bsc-dataseed3.bnbchain.org",
    "https://bsc-dataseed4.bnbchain.org",
    "https://rpc-bsc.48.club",
    "https://koge-rpc-bsc.48.club",
    "https://endpoints.omniatech.io/v1/bsc/mainnet/public",
    "https://bsc-pokt.nodies.app",
    "https://bsc-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3",
    "https://bscrpc.com",
  ],
  [SupportedChainId.POLYGON_MAINNET]: [
    "https://1rpc.io/matic",
    "https://polygon.drpc.org",
    "https://polygon.llamarpc.com",
    "https://polygon.rpc.blxrbdn.com",
    "https://polygon.meowrpc.com",
    "https://gateway.tenderly.co/public/polygon",
    "https://api.tatum.io/v3/blockchain/node/polygon-mainnet",
    "https://rpc-mainnet.matic.quiknode.pro",
    "https://polygon.blockpi.network/v1/rpc/public",
    "https://polygon.gateway.tenderly.co",
    "https://public.stackup.sh/api/v1/node/polygon-mainnet",
    "https://polygon-bor-rpc.publicnode.com",
    "https://polygon-pokt.nodies.app",
  ],
  [SupportedChainId.OPBNB_MAINNET]: [
    "https://opbnb.publicnode.com"
  ],
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
  [SupportedChainId.FANTOM_TESTNET]: [
    "https://rpc.testnet.fantom.network",
    "https://endpoints.omniatech.io/v1/fantom/testnet/public",
    "https://rpc.ankr.com/fantom_testnet",
    "https://fantom-testnet.public.blastapi.io",
    "https://fantom-testnet-rpc.publicnode.com",
    "https://fantom.api.onfinality.io/public",
  ],
  [SupportedChainId.FANTOM_SONIC]: [
    "https://rpc.sonic.fantom.network/",
  ],
  [SupportedChainId.HEDERA_MAINNET]: [
    "https://mainnet.hashio.io/api"
  ],
  [SupportedChainId.HEDERA_TESTNET]: [
    "https://testnet.hashio.io/api"
  ],
  [SupportedChainId.POLYGON_ZKEVM]: [
    "https://zkevm-rpc.com",
    "https://rpc.ankr.com/polygon_zkevm",
    "https://1rpc.io/polygon/zkevm",
    "https://polygon-zkevm.drpc.org",
    "https://polygon-zkevm-mainnet.public.blastapi.io",
    "https://polygon-zkevm.blockpi.network/v1/rpc/public",
  ],
  [SupportedChainId.GANACHE]: [
    "http://localhost:8545"
  ],
  [SupportedChainId.MANTLE_MAINNET]: [
    "https://mantle.drpc.org",
    "https://rpc.mantle.xyz",
    "https://mantle-mainnet.public.blastapi.io",
    "https://mantle.publicnode.com",
    "https://rpc.ankr.com/mantle",
    "https://1rpc.io/mantle",
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
  [SupportedChainId.ARTHERA_MAINNET]: [
    "https://rpc.arthera.net"
  ],
  [SupportedChainId.ARTHERA_TESTNET]: [
    "https://rpc-test.arthera.net"
  ],
  [SupportedChainId.UNREAL]: [
    "https://rpc.unreal-orbit.gelato.digital",
  ],
  [SupportedChainId.REAL]: [
    "https://real.drpc.org",
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
  [SupportedChainId.SEPOLIA]: [
    "https://1rpc.io/sepolia"
  ],
  [SupportedChainId.ARBITRUM_MAINNET]: [
    "https://arbitrum.llamarpc.com"
  ],
  [SupportedChainId.POLYGON_MUMBAI]: [
    "https://polygon-testnet.public.blastapi.io"
  ],
  [SupportedChainId.BLAST_MAINNET]: [
    "https://rpc.blast.io",
    "https://rpc.ankr.com/blast",
    "https://blast.blockpi.network/v1/rpc/public",
    "https://blast.blockpi.network/v1/rpc/public",
    "https://blast.din.dev/rpc",
    "https://blast.gasswap.org",
    "https://blastl2-mainnet.public.blastapi.io",
  ],
  [SupportedChainId.TAIKO_HEKLA]: [
    "https://rpc.ankr.com/taiko_hekla",
    "https://taiko-hekla.blockpi.network/v1/rpc/public",
    "https://rpc.hekla.taiko.xyz",
    "https://hekla.taiko.tools",
  ],
  [SupportedChainId.SCROLL_MAINNET]: [
    "https://rpc.scroll.io",
    "https://scroll.blockpi.network/v1/rpc/public",
    "https://1rpc.io/scroll",
    "https://scroll.drpc.org",
    "https://scroll-mainnet.rpc.grove.city/v1/a7a7c8e2",
    "https://rpc.ankr.com/scroll",
    "https://scroll-mainnet.chainstacklabs.com",
  ],
  [SupportedChainId.LINEA_MAINNET]: [
    "https://1rpc.io/linea",
    "https://rpc.linea.build",
    "https://linea.blockpi.network/v1/rpc/public",
    "https://linea.decubate.com",
    "https://linea.drpc.org",
  ],
  [SupportedChainId.HORIZEN_MAINNET]: [
    "https://rpc.ankr.com/horizen_eon"
  ],
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
    "https://base.llamarpc.com"
  ],
  [SupportedChainId.ZKSYNC_TESTNET]: [
    "https://sepolia.era.zksync.dev"
  ],
  [SupportedChainId.ZKSYNC_MAINNET]: [
    "https://mainnet.era.zksync.io",
    "https://1rpc.io/zksync2-era",
    "https://zksync-era.blockpi.network/v1/rpc/public",
    "https://zksync.meowrpc.com",
  ],
  [SupportedChainId.BLAST_SEPOLIA]: [
    "https://sepolia.blast.io"
  ],
  [SupportedChainId.X1_TESTNET]: [
    "https://x1testrpc.okx.com",
    "https://x1-testnet.blockpi.network/v1/rpc/public",
  ],
  [SupportedChainId.CELO_MAINNET]: [
    "https://forno.celo.org",
    "https://rpc.ankr.com/celo",
    "https://1rpc.io/celo",
  ],
  [SupportedChainId.KAVA_MAINNET]: [
    "https://evm.kava.io",
    "https://rpc.ankr.com/kava_evm",
    "https://kava.api.onfinality.io/public",
    "https://kava-evm-rpc.publicnode.com",
    "https://kava-pokt.nodies.app",
    "https://evm.kava.chainstacklabs.com",
    "https://evm.kava-rpc.com",
  ],
};

const defaultRpcUrls: Record<SupportedChainId, string> = {
  [SupportedChainId.ETHEREUM_MAINNET]: fallbackRpcUrls[SupportedChainId.ETHEREUM_MAINNET][0],
  [SupportedChainId.OPTIMISM_MAINNET]: fallbackRpcUrls[SupportedChainId.OPTIMISM_MAINNET][0],
  [SupportedChainId.BSC_MAINNET]: fallbackRpcUrls[SupportedChainId.BSC_MAINNET][0],
  [SupportedChainId.POLYGON_MAINNET]: fallbackRpcUrls[SupportedChainId.POLYGON_MAINNET][0],
  [SupportedChainId.OPBNB_MAINNET]: fallbackRpcUrls[SupportedChainId.OPBNB_MAINNET][0],
  [SupportedChainId.FANTOM_MAINNET]: fallbackRpcUrls[SupportedChainId.FANTOM_MAINNET][0],
  [SupportedChainId.FANTOM_TESTNET]: fallbackRpcUrls[SupportedChainId.FANTOM_TESTNET][0],
  [SupportedChainId.FANTOM_SONIC]: fallbackRpcUrls[SupportedChainId.FANTOM_SONIC][0],
  [SupportedChainId.HEDERA_MAINNET]: fallbackRpcUrls[SupportedChainId.HEDERA_MAINNET][0],
  [SupportedChainId.HEDERA_TESTNET]: fallbackRpcUrls[SupportedChainId.HEDERA_TESTNET][0],
  [SupportedChainId.POLYGON_ZKEVM]: fallbackRpcUrls[SupportedChainId.POLYGON_ZKEVM][0],
  [SupportedChainId.GANACHE]: fallbackRpcUrls[SupportedChainId.GANACHE][0],
  [SupportedChainId.MANTLE_MAINNET]: fallbackRpcUrls[SupportedChainId.MANTLE_MAINNET][0],
  [SupportedChainId.EVMOS_MAINNET]: fallbackRpcUrls[SupportedChainId.EVMOS_MAINNET][0],
  [SupportedChainId.ARTHERA_MAINNET]: fallbackRpcUrls[SupportedChainId.ARTHERA_MAINNET][0],
  [SupportedChainId.ARTHERA_TESTNET]: fallbackRpcUrls[SupportedChainId.ARTHERA_TESTNET][0],
  [SupportedChainId.UNREAL]: fallbackRpcUrls[SupportedChainId.UNREAL][0],
  [SupportedChainId.REAL]: fallbackRpcUrls[SupportedChainId.REAL][0],
  [SupportedChainId.HARDHAT]: fallbackRpcUrls[SupportedChainId.HARDHAT][0],
  [SupportedChainId.AVALANCHE_MAINNET]: fallbackRpcUrls[SupportedChainId.AVALANCHE_MAINNET][0],
  [SupportedChainId.SEPOLIA]: fallbackRpcUrls[SupportedChainId.SEPOLIA][0],
  [SupportedChainId.ARBITRUM_MAINNET]: fallbackRpcUrls[SupportedChainId.ARBITRUM_MAINNET][0],
  [SupportedChainId.POLYGON_MUMBAI]: fallbackRpcUrls[SupportedChainId.POLYGON_MUMBAI][0],
  [SupportedChainId.BLAST_MAINNET]: fallbackRpcUrls[SupportedChainId.BLAST_MAINNET][0],
  [SupportedChainId.TAIKO_HEKLA]: fallbackRpcUrls[SupportedChainId.TAIKO_HEKLA][0],
  [SupportedChainId.SCROLL_MAINNET]: fallbackRpcUrls[SupportedChainId.SCROLL_MAINNET][0],
  [SupportedChainId.LINEA_MAINNET]: fallbackRpcUrls[SupportedChainId.LINEA_MAINNET][0],
  [SupportedChainId.HORIZEN_MAINNET]: fallbackRpcUrls[SupportedChainId.HORIZEN_MAINNET][0],
  [SupportedChainId.BASE_MAINNET]: fallbackRpcUrls[SupportedChainId.BASE_MAINNET][0],
  [SupportedChainId.ZKSYNC_TESTNET]: fallbackRpcUrls[SupportedChainId.ZKSYNC_TESTNET][0],
  [SupportedChainId.ZKSYNC_MAINNET]: fallbackRpcUrls[SupportedChainId.ZKSYNC_MAINNET][0],
  [SupportedChainId.BLAST_SEPOLIA]: fallbackRpcUrls[SupportedChainId.BLAST_SEPOLIA][0],
  [SupportedChainId.X1_TESTNET]: fallbackRpcUrls[SupportedChainId.X1_TESTNET][0],
  [SupportedChainId.CELO_MAINNET]: fallbackRpcUrls[SupportedChainId.CELO_MAINNET][0],
  [SupportedChainId.KAVA_MAINNET]: fallbackRpcUrls[SupportedChainId.KAVA_MAINNET][0],
};

const infuraSupportedNetworks: Partial<Record<SupportedChainId, boolean>> = {
  [SupportedChainId.ETHEREUM_MAINNET]: true,
  [SupportedChainId.BASE_MAINNET]: false,
  [SupportedChainId.POLYGON_MAINNET]: true,
  [SupportedChainId.OPTIMISM_MAINNET]: true,
  [SupportedChainId.ARBITRUM_MAINNET]: true,
  [SupportedChainId.AVALANCHE_MAINNET]: true,
};

// TODO: import ChainConfig | CustomChain from hardhat-verify
interface ChainConfig {
  network: string;
  chainId: number;
  urls: {
    apiURL: string;
    browserURL: string;
  };
};

interface ChainConfigMinimal {
  urls: {
    apiURL: string;
    browserURL: string;
  };
};

// Only need to specify etherscanConfig for a chain if it's not supported by default:
// npx hardhat verify --list-networks
// for configs of already supported networks(with different chainNames) look inside: @nomiclabs/hardhat-etherscan/src/ChainConfig.ts
const etherscanConfig: Partial<Record<SupportedChainId, ChainConfigMinimal>> = {
  [SupportedChainId.BASE_MAINNET]: {
    urls: {
      apiURL: "https://api.basescan.org/api",
      browserURL: "https://basescan.org/",
    },
  },
  [SupportedChainId.EVMOS_MAINNET]: {
    urls: {
      apiURL: "https://escan.live/api",
      browserURL: "https://escan.live"
    },
  },
  [SupportedChainId.ARTHERA_MAINNET]: {
    urls: {
      apiURL: "https://explorer.arthera.net/api",
      browserURL: "https://explorer.arthera.net"
    },
  },
  [SupportedChainId.ARTHERA_TESTNET]: {
    urls: {
      apiURL: "https://explorer-test.arthera.net/api",
      browserURL: "https://explorer-test.arthera.net"
    },
  },
  [SupportedChainId.UNREAL]: {
    urls: {
      apiURL: "https://unreal.blockscout.com/api",
      browserURL: "https://unreal.blockscout.com"
    },
  },
  [SupportedChainId.REAL]: {
    urls: {
      apiURL: "https://explorer.re.al/api",
      browserURL: "https://explorer.re.al"
    },
  },
  [SupportedChainId.CELO_MAINNET]: {
    urls: {
      apiURL: "https://api.celoscan.io/api",
      browserURL: "https://celoscan.io/",
    },
  },
  [SupportedChainId.BLAST_MAINNET]: {
    urls: {
      apiURL: "https://api.blastscan.io/api",
      browserURL: "https://blastscan.io/",
    },
  },
  [SupportedChainId.KAVA_MAINNET]: {
    urls: {
      apiURL: "https://kavascan.com/api",
      browserURL: "https://kavascan.com/",
    },
  },
  [SupportedChainId.SCROLL_MAINNET]: {
    urls: {
      apiURL: "https://api.scrollscan.com/api",
      browserURL: "https://scrollscan.com/",
    },
  },
  [SupportedChainId.MANTLE_MAINNET]: {
    // urls: {
    //   apiURL: "https://api.routescan.io/v2/network/mainnet/evm/5000/etherscan",
    //   browserURL: "https://mantlescan.info"
    urls: {
      apiURL: "https://explorer.mantle.xyz/api",
      browserURL: "https://explorer.mantle.xyz/"
    }
  },
  [SupportedChainId.POLYGON_ZKEVM]: {
    urls: {
      apiURL: "https://api-zkevm.polygonscan.com/api",
      browserURL: "https://zkevm.polygonscan.com"
    },
  },
  [SupportedChainId.LINEA_MAINNET]: {
    urls: {
      apiURL: "https://api.lineascan.build/api",
      browserURL: "https://lineascan.build/"
    },
  },
  [SupportedChainId.OPBNB_MAINNET]: {
    urls: {
      apiURL: `https://open-platform.nodereal.io/${process.env.NODEREAL_API_KEY}/op-bnb-mainnet/contract/`,
      browserURL: "https://opbnbscan.com/",
    },
  },
  [SupportedChainId.FANTOM_MAINNET]: {
    urls: {
      apiURL: "https://api.ftmscan.com/api",
      browserURL: "https://ftmscan.com",
    },
  },
  [SupportedChainId.X1_TESTNET]: {
    urls: {
      apiURL: "https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/XLAYER_TESTNET",
      browserURL: "https://www.oklink.com/xlayer-test"
    },
  },
  [SupportedChainId.TAIKO_HEKLA]: {
    urls: { // a routescan explorer
      apiURL: "https://api.routescan.io/v2/network/testnet/evm/167009/etherscan",
      browserURL: "https://hekla.taikoscan.network/"
    },
  },
};

// Utility type to extract and enforce keys from etherscanConfig
type EnforcedApiKeys<T extends object> = {
  [P in keyof T]: string;
} & Partial<Record<SupportedChainId, string>>;

const dummyApiKey = "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz";

const etherscanApiKeys: EnforcedApiKeys<typeof etherscanConfig> = {
  // required SupportedChainId since specified in etherscanConfig
  [SupportedChainId.BASE_MAINNET]: process.env.BASESCAN_API_KEY || "",
  [SupportedChainId.EVMOS_MAINNET]: process.env.ESCAN_API_KEY || "",
  [SupportedChainId.ARTHERA_MAINNET]: dummyApiKey,
  [SupportedChainId.ARTHERA_TESTNET]: dummyApiKey,
  [SupportedChainId.UNREAL]: dummyApiKey,
  [SupportedChainId.REAL]: dummyApiKey,
  [SupportedChainId.CELO_MAINNET]: process.env.CELOSCAN_API_KEY || "",
  [SupportedChainId.BLAST_MAINNET]: process.env.BLASTSCAN_API_KEY || "",
  [SupportedChainId.KAVA_MAINNET]: process.env.KAVASCAN_API_KEY || "",
  [SupportedChainId.SCROLL_MAINNET]: process.env.SCROLLSCAN_API_KEY || "",
  [SupportedChainId.MANTLE_MAINNET]: process.env.MANTLESCAN_API_KEY || "",
  [SupportedChainId.POLYGON_ZKEVM]: process.env.ZKEVMSCAN_API_KEY || "",
  [SupportedChainId.LINEA_MAINNET]: process.env.LINEASCAN_API_KEY || "",
  [SupportedChainId.OPBNB_MAINNET]: process.env.OPBNBSCAN_API_KEY || "",
  [SupportedChainId.FANTOM_MAINNET]: process.env.FTMSCAN_API_KEY || "",
  [SupportedChainId.X1_TESTNET]: dummyApiKey, // no api key required
  [SupportedChainId.TAIKO_HEKLA]: dummyApiKey, // no api key required

  // extra optional SupportedChainId
  [SupportedChainId.ARBITRUM_MAINNET]: process.env.ARBISCAN_API_KEY || "",
  [SupportedChainId.AVALANCHE_MAINNET]: process.env.SNOWTRACE_API_KEY || "",
  [SupportedChainId.BSC_MAINNET]: process.env.BSCSCAN_API_KEY || "",
  [SupportedChainId.ETHEREUM_MAINNET]: process.env.ETHERSCAN_API_KEY || "",
  [SupportedChainId.OPTIMISM_MAINNET]: process.env.OPTIMISM_API_KEY || "",
  [SupportedChainId.POLYGON_MAINNET]: process.env.POLYGONSCAN_API_KEY || "",
  [SupportedChainId.POLYGON_MUMBAI]: process.env.POLYGONSCAN_API_KEY || "",
  [SupportedChainId.SEPOLIA]: process.env.ETHERSCAN_API_KEY || "",
};

// Runtime check to ensure all required keys are present
// Build/compile time check with a type to enforce this doesn't seem possible
function verifyConfigIntegrity(config: Partial<Record<SupportedChainId, ChainConfigMinimal>>, apiKeys: Record<SupportedChainId, string>) {
  for (const key in config) {
    if (!(key in apiKeys)) {
      throw new Error(`Explorer API key for ${SupportedChainId[key as any]} is missing`);
    }
  }
};

// Call this function at the start of your application
verifyConfigIntegrity(etherscanConfig, etherscanApiKeys as Record<SupportedChainId, string>);

function getChainUrl(chainId: SupportedChainId): string {
  // Check if the chainId has a custom URL in infuraSupportedNetworks
  if (infuraSupportedNetworks[chainId]) {
    return `https://${chainNames[chainId]}.infura.io/v3/${infuraApiKey}`;
  }

  return defaultRpcUrls[chainId];
};

function getChainConfig(chainId: SupportedChainId): NetworkUserConfig {
  const jsonRpcUrl = getChainUrl(chainId);

  return {
    accounts: {
      count: 10,
      mnemonic,
      path: "m/44'/60'/0'/0",
    },
    chainId,
    url: jsonRpcUrl,
    timeout: 60_000 // added as the default timeout isn't sufficient for Hedera
  };
};

const chainConfigs = Object.entries(chainNames).reduce((config, [chainIdString, chainName]) => {
  const chainId = Number(chainIdString);
  if (isValidChainId(chainId)) {
    config[chainName] = getChainConfig(chainId);
    return config;
  } else {
    throw new Error("Invalid chainId");
  }
}, {} as Record<string, NetworkUserConfig>);

const chainVerifyApiKeys = Object.entries(chainNames).reduce((config, [chainIdString, chainName]) => {
  const chainId = Number(chainIdString);
  if (isValidChainId(chainId)) {
    config[chainName] = etherscanApiKeys[chainId] || "";
    return config;
  } else {
    throw new Error("Invalid chainId");
  }
}, {} as Record<string, string>);

const chainConfigsArray: ChainConfig[] = Object.entries(etherscanConfig).reduce((acc, [chainIdString, config]) => {
  const chainId = Number(chainIdString) as SupportedChainId;
  const networkName = chainNames[chainId];
  // Construct the ChainConfig object if URLs are provided
  if (config?.urls) {
    const chainConfig: ChainConfig = {
      network: networkName,
      chainId,
      urls: config.urls,
    };
    acc.push(chainConfig);
  }
  return acc;
}, [] as ChainConfig[]);

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: 0,
  },
  etherscan: {
    apiKey: {
      ...chainVerifyApiKeys
    },
    customChains: chainConfigsArray
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
      accounts: {
        mnemonic,
      },
      chainId: SupportedChainId.HARDHAT,
    },
    ganache: {
      accounts: {
        mnemonic,
      },
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
    target: "ethers-v5",
  },
  mocha: {
    timeout: 600_000, // 10min
  },
};

export default config;
