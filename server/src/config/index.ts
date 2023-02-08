import fs from 'fs'
import getNetworkName from '@src/utils/getNetworkName'
import { Currency, Network } from '@src/models/currencies'

type ApeShiftConfig = {
  id?: number,
  api_secret: string,
  public_id: string,
  queue_name: string
  connection_string: string
}

type CryptocompareConfig = {
  api_key: string
}

type Secret = {
  cryptocompare: CryptocompareConfig,
  apeshift: ApeShiftConfig
}

const PATH = './secret.json'
const { cryptocompare, apeshift }: Secret = JSON.parse(fs.readFileSync(PATH, 'utf8'))
const PRICER_THROTTLE_MSEC = 5000

const CURRENCY: Currency = process.env.CURRENCY as Currency || 'ltc'
const NET: Network = process.env.NET as Network || 'mainnet'

const DB_PATH = `./db/${getNetworkName(CURRENCY, NET)}.json`

const MAGIC = 'JUST'

console.log(CURRENCY)
console.log(NET)

export {
  CURRENCY,
  NET,
  cryptocompare,
  apeshift,
  PRICER_THROTTLE_MSEC,
  DB_PATH,
  MAGIC
}

export { default as networks } from './networks'