import { Currency, Network } from "./currencies";
import { Payment } from "./payment";

export enum OrderStatus {
  waiting = 'waiting',
  confirmed = 'confirmed'
}

export type Order = {
  currency: Currency,
  network: Network,
  timestamp: number,
  deadline: number,
  address: string,
  item_id: number,
  status: OrderStatus,
  task_id: number,
  client_token: string,
  payment: Payment
}
