import base64 from 'js-base64'
import api, { InvokeClientMethod, MethodTypes } from '@src/apeshift-lib/api';
import { apeshift } from '@src/config';
import { Event } from '@src/apeshift-lib/base-listener';

export async function completePayment(task_id: any, payment: any) {
  const xclient = {
    completed: true,
    transaction: 'txn',
    payment: {
      confirmed: payment.confirmed,
      unconfirmed: payment.unconfirmed,
      left: payment.left,
    },
  };

  const xinvoke = {
    keep_alive: false,
    message: xclient,
    task_id,
  };

  let result = await api.request<InvokeClientMethod>({
    type: MethodTypes.invoke_client,
    data: xinvoke
  }, {
    public_id: apeshift.public_id,
    api_secret: apeshift.api_secret
  })
  console.log(result)
}

export async function partialPayment(task_id: any, payment: any) {
  const xclient = {
    completed: false,
    transaction: 'txn',
    instruction:
      'Payment detected but less than expected, please send missing amount.',
    payment: {
      confirmed: payment.confirmed,
      unconfirmed: payment.unconfirmed,
      left: payment.left,
    },
  };

  const xinvoke = {
    keep_alive: true,
    message: xclient,
    task_id,
  };

  let result = await api.request<InvokeClientMethod>({
    type: MethodTypes.invoke_client,
    data: xinvoke
  }, {
    public_id: apeshift.public_id,
    api_secret: apeshift.api_secret
  })
  console.log(result)
}

export function tryRegisterEvent<T extends Event>(data: T['data'], subject: T['subject'], filedb: any) {
  console.log(subject)
  let event = filedb.get(`events.${data.txnId}.${subject}`);
    
  if (event !== undefined) 
    return false

  event = {
    timestamp: +Date.now(),
    address: data.address,
    height: data.height,
    network: data.network,
    value: data.value,
  };

  filedb.add(`events.${data.txnId}.${subject}`, event);
  return true
}

