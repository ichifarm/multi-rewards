export enum SupportedChainId {
  ETHEREUM_MAINNET = 1,
  OPTIMISM_MAINNET = 10,
  BSC_MAINNET = 56,
  POLYGON_MAINNET = 137,
  X1_TESTNET = 195,
  OPBNB_MAINNET = 204,
  FANTOM_MAINNET = 250,
  FANTOM_TESTNET = 4002,
  FANTOM_SONIC = 64165,
  ZKSYNC_TESTNET = 280,
  ZKSYNC_MAINNET = 324,
  HEDERA_MAINNET = 295,
  HEDERA_TESTNET = 296,
  POLYGON_ZKEVM = 1101,
  GANACHE = 1337,
  KAVA_MAINNET = 2222,
  MANTLE_MAINNET = 5000,
  HORIZEN_MAINNET = 7332,
  BASE_MAINNET = 8453,
  EVMOS_MAINNET = 9001,
  ARTHERA_MAINNET = 10242,
  ARTHERA_TESTNET = 10243,
  UNREAL = 18233, // testnet
  REAL = 111188, // mainnet
  HARDHAT = 31337,
  ARBITRUM_MAINNET = 42161,
  CELO_MAINNET = 42220,
  AVALANCHE_MAINNET = 43114,
  LINEA_MAINNET = 59144,
  POLYGON_MUMBAI = 80001,
  BLAST_MAINNET = 81457,
  TAIKO_HEKLA = 167009,
  SCROLL_MAINNET = 534352,
  SEPOLIA = 11155111,
  BLAST_SEPOLIA = 168587773,
};

export const SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
  (value): value is number => typeof value === "number",
);

export function isValidChainId(value: number | undefined): value is SupportedChainId {
  return value !== undefined && Object.values(SupportedChainId).includes(value);
};
