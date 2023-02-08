import { Subjects } from '@src/apeshift-lib/subjects';

export interface MempoolEvent<T = any> {
  subject: typeof Subjects.Mempool;
  data: {
    txnId: string,
    amount: string, //sat
    userData: T,
    value: string,
    address: string,
    network: string
  }
}
