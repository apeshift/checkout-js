import bigInt from 'big-integer'
import 'jest'
import satoshi from '../satoshi'

it('can convert satoshi and vice versa', async () => {
  expect(bigInt(122).compare(satoshi.to('1.22', 2))).toEqual(0)
})