import { Subjects } from "../subjects";

export interface BlockEvent<T = any> {
  subject: typeof Subjects.Block;
  data: {
    txnId: string,
    amount: string, //sat
    userData: T,
    value: string,
    address: string,
    height: number,
    network: string
  }
}