import { Currency, Network } from "@src/models/currencies"

export default function getNetworkName(currency: Currency, network: Network) {
  if (network === 'mainnet')
    return currency
  
  return `${currency}_${network}`
}