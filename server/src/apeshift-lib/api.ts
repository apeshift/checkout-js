import crypto from 'crypto'
import axios from 'axios'
import base64 from 'js-base64'

interface Method {
  type: MethodTypes;
  data: any;
}

interface RequestData<T extends Method> {
  jsonrpc: string,
  method: T['type']
  params: T['data'],
  id: string
}

interface ResponseData<T = any> {
  id: string,
  jsonrpc: string,
  error: {
    message: string
  } | null,
  result: T
}

export enum MethodTypes { 
  get_client_token = 1, 
  invoke_client = 2, 
  subscribe = 3, 
  send_message = 4, 
  add_queue = 5, 
  allow_sender = 7 
}

interface RequestOptions {
  api_secret: string, 
  public_id: string,
  url?: string
}

const defOptions = {
  url: "https://api.apeshift.com"
}

async function request<T extends Method>(method: T, options: RequestOptions) {
  const mergedOptions: RequestOptions = {
    ...defOptions,
    ...options
  }

  //convert custom data to base64
  if (method.data.include_data) {
    method.data.include_data = base64.encode(JSON.stringify(method.data.include_data))
  }

  if (method.data.message) {
    method.data.message = base64.encode(JSON.stringify(method.data.message))
  }

  const obj: RequestData<T> = {
    jsonrpc: "2.0",
    method: method.type,
    id: "2",
    params: method.data
  };

  const sign = crypto
    .createHmac('sha512', mergedOptions.api_secret)
    .update(JSON.stringify(obj))
    .digest('hex');

  let config = {
    headers: {
      "public-id": mergedOptions.public_id,
      sign
    }
  }

  const { data } : { data: ResponseData } = await axios.post(mergedOptions.url as string, obj, config)

  if (data.error != null)
  {
    console.log(data.error.message);
    throw 'Unable to make request to apeshift'
  }

  return data.result;
}

export interface InvokeClientMethod<T = any> extends Method {
  type: MethodTypes.invoke_client,
  data: {
    keep_alive: boolean,
    message: T,
    task_id: string
  }
}

export interface SubscribeMethod<T = any> extends Method {
  type: MethodTypes.subscribe,
  data: {
    address: string,
    include_data: T,
    queue_name: string,
    network: string
  }
}

export interface GetClientTokenMethod extends Method {
  type: MethodTypes.get_client_token,
  data: {
    task_info: string,
    expire_minutes: number,
    send_offline_message: boolean,
    single_instance: boolean,
    timeout: number
  }
}

export interface AddQueueMethod extends Method {
  type: MethodTypes.add_queue,
  data: {
    queue_name: string
  }
}

export default {
  request
}