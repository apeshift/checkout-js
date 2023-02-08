import { Network } from "bitcoinjs-lib"

export type CurrencyNet = {
  testnet: Network,
  regtest: Network,
  mainnet: Network
}

const ltc: CurrencyNet = {
  testnet: {
    messagePrefix: '\x18Litecoin Signed Message:\n',
    bech32: 'tl',
    bip32: {
      public: 0x043587cf,
      private: 0x04358394,
    },
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
  },
  regtest: {
    messagePrefix: '\x18Litecoin Signed Message:\n',
    bech32: 'tl',
    bip32: {
      public: 0x043587cf,
      private: 0x04358394,
    },
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
  },
  mainnet: {
    messagePrefix: '\x18Litecoin Signed Message:\n',
    bech32: 'ltc',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4
    },
    pubKeyHash: 0x30,
    scriptHash: 0x32,
    wif: 0xb0
  }
}

const btc: CurrencyNet = {
  mainnet: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'bc',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    pubKeyHash: 0x00,
    scriptHash: 0x05,
    wif: 0x80,
  },
  regtest: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'bcrt',
    bip32: {
      public: 0x043587cf,
      private: 0x04358394,
    },
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
  },
  testnet: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'tb',
    bip32: {
      public: 0x043587cf,
      private: 0x04358394,
    },
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
  }
}


export default {
  ltc,
  btc
}
