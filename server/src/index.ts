import 'module-alias/register' //enable path aliases
import express, { NextFunction, Request, Response } from 'express'
import apicache from 'apicache'
import rateLimit from "express-rate-limit"
import processor from '@src/processor'
import { fetchRateThrottled } from '@src/pricer'
import filedb from '@src/file_db'
import { apeshift, CURRENCY } from '@src/config'
import ApeClientWs from '@src/apeshift-lib/ape-client-ws'
import { BlockEventListener } from '@src/events/listeners/block-event-listener'
import { MempoolEventListener } from '@src/events/listeners/mempool-event-listener'
import { Currency } from '@src/models/currencies'

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
});
const cache = apicache.options({ headers: { 'cache-control': 'no-cache' }}).middleware

const app = express();

const client = ApeClientWs.connect({
  authkey: apeshift.connection_string,
  url: 'wss://apeshift.com/mq/server_ws',
  keepAlive: true,
  keepAliveInterval: 1000 * 2 * 60
})

new BlockEventListener(client).listen()
new MempoolEventListener(client).listen()

app.use(limiter);
//app.use(cache('30 seconds', (req: Request, res: Response) => res.statusCode === 200 ))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(function (req: Request, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.get('/order/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const order = filedb.get(`orders.${id}`);
  const item = filedb.get(`items.${order.item_id}`);
  res.send({ order: { ...order, id, item: { ...item, id: order.item_id } } });
});

app.get('/items', (req: Request, res: Response) => {
  const dbItems = filedb.get('items');
  const accounts = filedb.get('accounts');

  const items = Object.keys(dbItems)
    .slice(0, 10)
    .map((k) => ({
      ...dbItems[k],
      id: k,
      merchant: {
        id: dbItems[k].merchant,
        name: accounts[dbItems[k].merchant].name,
      },
    }));
  res.send({ items });
});

app.get('/price/:currency?', cache('30 seconds'), async (req: Request, res: Response) => {
  const { currency } = req.params
  const { USD } = await fetchRateThrottled(currency as Currency || CURRENCY);
  res.send({ USD, currency: currency || CURRENCY, timestamp: +Date.now() });
});

app.post('/createOrder', async (req: Request, res: Response) => {
  const { id } = req.body;
  const order = await processor.createOrder(id);
  res.send({ order });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});















/*
processor.createNetworkQueue("bitcoin_regtest_queue")
*/

/*
app.post('/test/completePayment', (req: any, res: any) => {
  const { task_id, delay_msec } = req.body;
  setTimeout(() => processor.completePayment(task_id), delay_msec || 0);
  res.send({ success: true });
});

app.post('/test/partialPayment', (req: any, res: any) => {
  const { task_id, delay_msec, amount } = req.body;
  setTimeout(
    () =>
      processor.partialPayment(task_id, {
        unconfirmed: amount,
        confirmed: '0',
      }),
    delay_msec || 0
  );
  res.send({ success: true });
});
*/