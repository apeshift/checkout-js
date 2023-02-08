import { useState } from 'react'
import { Text, Button, Box, Card, Flex } from 'theme-ui'
import axios from 'axios'
import { useHistory } from 'react-router'
import { CURRENCY, NET, SERVER_URL } from '@src/config'
import useItems from '@src/hooks/useItems'
import useRate from '@src/hooks/useRate'
import { getCurrencyInfo } from '@src/utils/getCurrencyInfo'

const currency = getCurrencyInfo(CURRENCY, NET)

export default function Items() {
  const history = useHistory()
  const [loading, setLoading] = useState<boolean>(false)
  const { rate } = useRate()
  const { items } = useItems()

  const onBuy = async (id: number) => {
    try {
      setLoading(true)
      const { data: { order } } = await axios.post(`${SERVER_URL}/createOrder`, {
        id
      })

      console.log(order)
      history.push({
        pathname: `/order/${order.id}`,
      })
    }
    catch (exc) {
      console.log(exc)
    }
    finally {
      setLoading(false)
    }
  }

  const renderItem = ({ name, price, id, merchant }: { name: string, price: any, merchant: any, id: number }) => {
    return (
      <Card  p={3} sx={{ maxWidth: '300px', position: 'relative' }} key={id} m={3} >
        <Flex mb={3} sx={{ flexDirection: 'column' }}>
          <Text p={2} sx={{ fontWeight: 'bold', position: 'absolute', right: 0, top: 0 }}>#{id}</Text>
          <Text mb={2} sx={{ fontSize: 20 ,fontWeight: 'bold' }}>{name}</Text>
          <Text>Merchant: {merchant.name}</Text>
          <Text>Price: {price.USD} $</Text>
          <Text>LTC: {parseFloat(price?.[CURRENCY as string]).toFixed(8)}</Text>
          
        </Flex>
        <Button
          sx={{ width: '100%' }}
          disabled={loading} 
          onClick={() => onBuy(id)}
        >
          {loading? '...' : 'Buy'}
        </Button>
      </Card>
    )
  }

  return (
    <Box> 
      <Card>     
        <Text mx={2}>{currency.symbol.toUpperCase()}: {rate}$ ({currency.network})</Text>
      </Card>
      {items?.map(renderItem)}
    </Box>
  );
}
