//@ts-ignore
import * as websocket from 'websocket'
import base64 from 'js-base64'
import camelize from '@src/utils/camelize'
import { Subject, Subjects } from './subjects';

const W3CWebSocket = websocket.w3cwebsocket;

export type EventType = 'message' | 'close'

export interface RawEvent {
  dqcommand: string
  result: any
}

interface ApeClientWsOptions {
  url?: string,
  authkey: string,
  keepAlive?: boolean,
  keepAliveInterval?: number
}

const defOptions: ApeClientWsOptions = {
  authkey: '',
  url: 'wss://bcq.async360.com',
  keepAlive: true,
  keepAliveInterval: 1000 * 2 * 60
}

class ApeClientWs {
  private authkey: string 
  private url: string
  private keepAlive: boolean
  private keepAliveInterval: number
  private client: any
  private handlers: any

  private static instance: ApeClientWs

  private constructor(options: ApeClientWsOptions) {
    const mergedOptions = {
      ...defOptions,
      ...options
    }
    
    this.authkey = mergedOptions.authkey
    this.url = mergedOptions.url as string
    this.keepAlive = mergedOptions.keepAlive as boolean
    this.keepAliveInterval = mergedOptions.keepAliveInterval as number
    this.handlers = {}

    this.start()
  }

  public static connect(options: ApeClientWsOptions): ApeClientWs {
    if (!ApeClientWs.instance) {
      ApeClientWs.instance = new ApeClientWs(options);
    }

    return ApeClientWs.instance;
  }

  private start() {
    this.client = new W3CWebSocket(
      this.url, 
      null, 
      null, 
      { "Connection-Token": this.authkey }, 
      undefined, 
      { keepalive: this.keepAlive, keepaliveInterval: this.keepAliveInterval }
    );

    this.client.onopen = this.onopen
    this.client.onclose = this.onclose
    this.client.onerror = this.onerror  
    this.client.onmessage = this.onmessage
  }

  subscribe(subject: Subject, handler: Function) {
    if (!this.handlers[subject]) {
      this.handlers[subject] = [handler]
    } else {
      this.handlers[subject].push(handler)
    }
  }

  unsubscribe(subject: Subject, handler: Function) {
    if (this.handlers[subject]) {
      const i = this.handlers[subject].findIndex((f: Function) => f === handler)
      if (i !== -1) {
        // it's important to not copy the array, otherwise function addresses will change
        this.handlers[subject].splice(i, 1)
      }
    }
  }

  private onmessage = (e: any) => {
    if (this.client.readyState === 1) { //OPEN
      const msg = this.parseMessage(e.data)
      const event = msg.result
      
      event.userData = event.userData? JSON.parse(base64.decode(event.userData)) : undefined
      const ack = () => this.client.send(msg.dqcommand)

      if ((Object.values(Subjects).some(s => s === event.txnEvent)) && this.handlers[event.txnEvent]) {  
        this.handlers[event.txnEvent].forEach((h: any) => {
          h(event, ack)
        });
      } else {
        //ack()
      }
    }
  }

  private parseMessage(data: any): RawEvent {
    return typeof data === 'string'
      ? camelize(JSON.parse(data))
      : camelize(JSON.parse(data.toString('utf8')))
  }

  private reconnect = () => {
    console.log('Reconnecting...')
    setTimeout(() => {
      this.start()
    }, 3000)
  }

  private onclose = () => {
    console.log('Closed. Reconnecting...')
    this.close()
    this.reconnect()
  }

  private onopen() {
    console.log('Connected. Waiting...')
  }

  private onerror() {
    console.log('Connection Error');
  }

  close = () => {
    if (this.client.readyState !== 1)
      return

    this.client.removeEventListener('message', this.onmessage)
    this.client.removeEventListener('error', this.onerror)
    this.client.close()
  }
}


export default ApeClientWs