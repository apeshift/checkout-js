export function getCurrencyInfo(currency: string, net: string) {
  switch (currency) {
    case 'btc': {
      return {
        name: 'Bitcoin',
        network: net,
        symbol: currency
      }
    }
    case 'ltc': {
      return {
        name: 'Bitcoin',
        network: net,
        symbol: currency
      }
    }
    default:
      throw new Error(`Currency: ${currency} is not supported`)
  }
}