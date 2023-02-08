import bigInt from 'big-integer';
import { BlockEvent } from '@src/apeshift-lib/events/block-event';
import { Listener } from '@src/apeshift-lib/base-listener';
import { Subjects } from '@src/apeshift-lib/subjects';
import filedb from '@src/file_db';
import satoshi from '@src/utils/satoshi';
import { completePayment, partialPayment, tryRegisterEvent } from './helper';
import { UserData } from './user-data';
import { Order, OrderStatus } from '@src/models/Order';

export class BlockEventListener extends Listener<BlockEvent<UserData>> {
  subject: typeof Subjects.Block = Subjects.Block;

  async onMessage(data: BlockEvent['data'], ack: any) {
    console.log(`${data.txnId} -> ${this.subject}`)
    
    const eventExists = tryRegisterEvent(data, this.subject, filedb) === false
    if (eventExists) {
      ack()
      return
    }

    const userData = data.userData
    //check order
    const order = filedb.get(`orders.${userData.order_id}`) as Order;

    if (!order || order.status === OrderStatus.confirmed) {
      ack()
      return;
    }

    const decimals = 8;
    let unconfirmed = satoshi.to(order.payment.unconfirmed, decimals);
    let confirmed = satoshi.to(order.payment.confirmed, decimals);
    let value = bigInt(data.value);
    const total = satoshi.to(order.payment.total, decimals);

    confirmed = confirmed.add(value);
    unconfirmed = bigInt.max(unconfirmed.minus(value), bigInt.zero);

    filedb.update(
      `orders.${userData.order_id}.payment.confirmed`,
      satoshi.from(confirmed, decimals)
    );
    filedb.update(
      `orders.${userData.order_id}.payment.unconfirmed`,
      satoshi.from(unconfirmed, decimals)
    );
    
    const left_confirmed = total.minus(confirmed);
    const left = total.minus(confirmed).minus(unconfirmed);

    if (left_confirmed.leq(bigInt.zero)) {
      // completed
      console.log('Mark as complete');
      filedb.update(`orders.${userData.order_id}.status`, OrderStatus.confirmed);
      completePayment(order.task_id, {
        confirmed: satoshi.from(confirmed, decimals),
        unconfirmed: satoshi.from(unconfirmed, decimals),
        left: '0',
      });
    } else if (total.gt(left)) {
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
