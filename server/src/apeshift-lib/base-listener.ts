import ApeClientWs from './ape-client-ws';
import { Subject } from './subjects';

export interface Event {
  subject: Subject;
  data: any;
}

export abstract class Listener<T extends Event> {
  abstract subject: T['subject'];
  abstract onMessage(data: T['data'], ack: Function): void;
  protected client: ApeClientWs;
  private handler: Function | null;

  constructor(client: ApeClientWs) {
    this.client = client;
    this.handler = null
  }

  listen() {
    this.handler = this.onMessage.bind(this)
    this.client.subscribe(this.subject, this.handler);
  }

  close() {
    if (!this.handler) {
      throw Error('There is not handler assigned')
    }
    
    this.client.unsubscribe(this.subject, this.handler)
  }
}
