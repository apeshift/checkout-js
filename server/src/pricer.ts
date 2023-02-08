import axios from 'axios';
import throttle from 'lodash.throttle'
import { cryptocompare, PRICER_THROTTLE_MSEC } from '@src/config'
import { Currency } from './models/currencies';

const BASE_URL = 'https://min-api.cryptocompare.com/data';
const API_KEY = cryptocompare.api_key;

export type Rate = {
  USD: number | null,
  currency: string | null
}

let price: Rate = {
  USD: null,
  currency: null
};

async function fetchRate(currency: any): Promise<Rate> {
  try {
    const { data } = await axios.get(
      `${BASE_URL}/price?fsym=${currency.toUpperCase()}&tsyms=USD&extraParams=${API_KEY}`
    );
    price.USD = data.USD;
    return price
  } catch (exc) {
    console.log(exc);
  } finally {
    return price;
  }
}

const fetchRateThrottled = async (currency: Currency) => {
  const res = await throttle(() => fetchRate(currency), PRICER_THROTTLE_MSEC)();
  return res as Rate
}

export {
  fetchRate,
  fetchRateThrottled
}