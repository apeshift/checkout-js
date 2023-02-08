
export const currencies = {
  LTC: "ltc",
  BTC: "btc"
} as const;

export const networks = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet',
  REGTEST: 'regtest'
} as const;

export type Currency = typeof currencies[keyof typeof currencies];
export type Network = typeof networks[keyof typeof networks];

