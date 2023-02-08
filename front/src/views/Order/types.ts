

export type Order = {
  address: string,
  id: string,
  price: {
    ltc: string,
  },
  item: {
    id: string,
    name: string
  },
  status: 'waiting' | 'expired',
  deadline: number,
  timestamp: number,
  task_id: string,
  client_token: string
}

export enum PageType {
  SCAN = 0,
  COPY = 1
}

export type Payment = {
  confirmed: string,
  unconfirmed: string,
  left?: string
}

export type OrderState = {
  payment: Payment,
  message?: string | null,
  completed: boolean,
  error: string | null,
  ticks: string,
  expired: boolean,
  left: string | null
}