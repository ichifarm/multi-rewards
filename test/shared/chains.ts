export enum SupportedChainId {
  ETHEREUM_MAINNET = 1,
  OPTIMISM_MAINNET = 10,
  BSC_MAINNET = 56,
  POLYGON_MAINNET = 137,
  OPBNB_MAINNET = 204,
  FANTOM_MAINNET = 250,
  ZKSYNC_TESTNET = 280,
  ZKSYNC_MAINNET = 324,
  HEDERA_MAINNET = 295,
  HEDERA_TESTNET = 296,
  POLYGON_ZKEVM = 1101,
  GANACHE = 1337,
  MANTLE_MAINNET = 5000,
  HORIZEN_MAINNET = 7332,
  BASE_MAINNET = 8453,
  EVMOS_MAINNET = 9001,
  HARDHAT = 31337,
  ARBITRUM_MAINNET = 42161,
  AVALANCHE_MAINNET = 43114,
  LINEA_MAINNET = 59144,
  POLYGON_MUMBAI = 80001,
  SEPOLIA = 11155111,
}

export const SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
  (value): value is number => typeof value === "number",
);

export function isValidChainId(value: number | undefined): value is SupportedChainId {
  return value !== undefined && Object.values(SupportedChainId).includes(value);
}
