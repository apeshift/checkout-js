import { Listener } from '@src/apeshift-lib/base-listener';
import { MempoolEvent } from '@src/apeshift-lib/events/mempool-event.ts';
import { Subjects } from '@src/apeshift-lib/subjects';
import filedb from '@src/file_db';
import { Order, OrderStatus } from '@src/models/Order';
import satoshi from '@src/utils/satoshi';
import bigInt from 'big-integer';
import { partialPayment, tryRegisterEvent } from './helper';
import { UserData } from './user-data';

export class MempoolEventListener extends Listener<MempoolEvent<UserData>> {
  subject: typeof Subjects.Mempool = Subjects.Mempool;

  async onMessage(data: MempoolEvent['data'], ack: any) {
    console.log(`${data.txnId} -> ${this.subject}`)

    if (filedb.get(`events.${data.txnId}.${Subjects.Block}`)) {
      console.log(`Ignore mempool transaction, as it's confirmed already`);
      //mempool event is absollete, ignore it
      ack()
      return;
    }

    const eventExists = tryRegisterEvent(data, this.subject, filedb) === false
    if (eventExists) {
      //such event already exists, ignore it
      ack()
      return
    }

    const userData = data.userData
    //check order
    const order = filedb.get(`orders.${userData.order_id}`) as Order;

    if (!order || order.status === OrderStatus.confirmed) {
      return;
    }

    const decimals = 8;
    let unconfirmed = satoshi.to(order.payment.unconfirmed, decimals);
    let confirmed = satoshi.to(order.payment.confirmed, decimals);
    let value = bigInt(data.value);
    const total = satoshi.to(order.payment.total, decimals);

    unconfirmed = bigInt.max(unconfirmed.minus(value), bigInt.zero);
    unconfirmed = unconfirmed.add(value);

    filedb.update(
      `orders.${userData.order_id}.payment.unconfirmed`,
      satoshi.from(unconfirmed, decimals)
    );

    const left = total.minus(confirmed).minus(unconfirmed);

    if (total.gt(left)) {
      console.log('Mark as partial complete');
      // pending
      partialPayment(order.task_id, {
        confirmed: satoshi.from(confirmed, decimals),
        unconfirmed: satoshi.from(unconfirmed, decimals),
        left: satoshi.from(bigInt.max(left, bigInt.zero), decimals),
      });
    }

    ack();
  }
}