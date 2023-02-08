import * as bitcoinjs from 'bitcoinjs-lib';
import { 
  apeshift,
  networks, 
  CURRENCY,
  NET, 
  MAGIC
} from '@src/config'
import filedb from '@src/file_db'
import { fetchRateThrottled } from '@src/pricer'
import getNetworkName from '@src/utils/getNetworkName'
import api, { AddQueueMethod, GetClientTokenMethod, InvokeClientMethod, MethodTypes, SubscribeMethod } from '@src/apeshift-lib/api';
import { UserData } from '@src/events/listeners/user-data';
import { Order, OrderStatus } from '@src/models/Order';
import { Payment } from '@src/models/payment';

const queue_name = apeshift.queue_name

const network = networks[CURRENCY][NET];
console.log(getNetworkName(CURRENCY, NET));

async function createOrder(productId: any) {
  let prev_index = null;
  let order_id = null;
  let merchant_id = null;
  try {
    const rate = await fetchRateThrottled(CURRENCY);
    const orders = filedb.get('orders');
    const accounts = filedb.get('accounts');
    const items = filedb.get('items');

    const item = items[productId];
    const merchant = accounts[item.merchant];
    merchant_id = item.merchant;
    const node = bitcoinjs.bip32.fromBase58(merchant.ext_pub_key, network);
    const child = node.derivePath(`m/0/${merchant.index}`);

    const address = bitcoinjs.payments.p2pkh({
      pubkey: child.publicKey,
      network,
    }).address as string;

    const ltcPrice = rate.USD? (item.price.USD / rate.USD).toFixed(8) : ''

    // put a check on price (production)

    order_id = Object.values(orders).length;
    const timestamp = +Date.now();
    const timeout = 20;
    const deadline = +(timestamp + timeout * 1000 * 60);

    const clientData: GetClientTokenMethod['data'] = {
      task_info: order_id.toString() + MAGIC,
      expire_minutes: 60 * 3,
      send_offline_message: true,
      single_instance: true,
      timeout
    };

    let { task_id, client_token } = await api.request<GetClientTokenMethod>({
      type: MethodTypes.get_client_token,
      data: clientData
    }, {
      public_id: apeshift.public_id,
      api_secret: apeshift.api_secret
    })

    const payment: Payment = {
      total: ltcPrice,
      confirmed: '0',
      unconfirmed: '0',
    }
    const order: Order = {
      currency: CURRENCY,
      network: NET,
      timestamp,
      deadline,
      address,
      item_id: productId,
      status: OrderStatus.waiting,
      task_id,
      client_token,
      payment,
    };

    filedb.add(`orders.${order_id}`, order);

    const mydata: UserData = {
      task_id,
      order_id,
    };

    const subscribe = {
      address,
      include_data: mydata,
      network: getNetworkName(CURRENCY, NET),
      queue_name: queue_name,
    };

    let result = await api.request<SubscribeMethod<UserData>>({
      type: MethodTypes.subscribe,
      data: subscribe
    }, {
      public_id: apeshift.public_id,
      api_secret: apeshift.api_secret
    })

    if (result && result.status === 'success') {
      //don't foget to update index
      prev_index = merchant.index;
      filedb.update(`accounts.${item.merchant}.index`, merchant.index + 1);

      return {
        id: order_id,
        ...order,
        ...result,
      };
    } else throw new Error('Unable to subscribe');
  } catch (exc) {
    //make sure you deleted order from the databse and unsubscribed

    if (order_id !== null) {
      console.log(`Removing order ${order_id}`);
      filedb.remove(`orders.${order_id}`);
    }

    if (merchant_id !== null && prev_index !== null) {
      const current_index = filedb.get(`accounts.${merchant_id}.index`);

      if (parseInt(current_index) === parseInt(prev_index) + 1) {
        console.log(
          `Updating index to ${prev_index} for merchant ${merchant_id}`
        );
        filedb.update(`accounts.${merchant_id}.index`, prev_index);
      }
    }

    console.log(exc);
    throw new Error('Unable to create an order');
  }
}

async function createNetworkQueue(queue_name: any) {
  let result = await api.request<AddQueueMethod>({
    type: MethodTypes.add_queue,
    data: {
      queue_name
    }
  }, {
    public_id: apeshift.public_id,
    api_secret: apeshift.api_secret
  })
  console.log(result)
  return result;
}

export default {
  createOrder,
  createNetworkQueue
};