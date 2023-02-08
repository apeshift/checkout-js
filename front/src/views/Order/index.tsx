import { useEffect, useState } from 'react'
import axios from 'axios'
import { Text, Button, Box, Heading, Flex, Divider } from 'theme-ui'
import QRCode from 'qrcode.react'
import { Base64 } from 'js-base64'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import { PaymentCard } from './styles'
import { ProgressBar } from './components/ProgressBar'
import { NavItems, NavItem } from './components/NavItems'
import useRate from '@src/hooks/useRate'
import { camelize } from '@src/utils/camelize'
import { CopyToClipboard, NotFound } from '@src/components'
import useOrder from '@src/hooks/useOrder'
import { OrderState, PageType, Payment } from './types'
import { CURRENCY, NET } from '@src/config'
import { getCurrencyInfo } from '@src/utils/getCurrencyInfo'

const currency = getCurrencyInfo(CURRENCY, NET)

const defOrderState: OrderState = {
  message: null,
  completed: false,
  error: null,
  ticks: "00:00",
  expired: false,
  payment: {
    confirmed: "0",
    unconfirmed: "0"
  },
  left: null
}

//follows bip21
function genPaymentLink(address: string, amount: string | null) {
  return `${currency.name.toLowerCase()}:${address}${amount === null? "" : `?amount=${amount}`}`
}

export default function Order() {
  const { rate } = useRate()

  const [orderState, setOrderState] = useState<OrderState>(defOrderState)
  const { ticks, expired, completed, message, payment, error, left } = orderState
  
  const [page, setPage] = useState<PageType>(PageType.SCAN)
  const { id } = useParams<{ id: string }>()
  const { order, loading: loadingOrder } = useOrder(id)

  const onMessage = (e: any) => {
    const obj = JSON.parse(e.data);
    console.log(obj)
    const { error, ticks, message, completed } = camelize(obj)
    
    let payment: Payment | null = null

    if (message) {
      const decoded = JSON.parse(Base64.decode(message))
      if (decoded && decoded.payment) {
        
        payment = decoded.payment
        //decodedMes = `${decoded.instruction}\n${decoded.amountInfo}`
      }
    }

    console.log(payment)

    setOrderState((prev) => ({
      completed: prev.completed || completed,
      error: error || prev.error,
      expired: ticks === "00:00" || !ticks,
      //message: decodedMes || prev.message,
      ticks,
      payment: payment || prev.payment,
      left: payment? payment.left : (prev.left || order.payment.total)
    } as OrderState))
  }

  useEffect(() => {
    if (order && order.client_token) {
      console.log('Connecting websocket')
      const socket = new WebSocket("wss://apeshift.com/ApeWS.ashx");
      socket.addEventListener('open', () => {
        const ecfa_request = {
          ClientToken: order.client_token
        }
        const sendtext = JSON.stringify(ecfa_request)
        socket?.send(sendtext)
      })

      socket.addEventListener('message', onMessage);

      socket.addEventListener('error', (msg: any) => {
        console.error('SocketIO: Error', msg)
      })

      return () => {
        if (socket) {
          //@ts-ignore
          socket.removeEventListener('message', onMessage)
          socket.close()
        }
      }
    }
  }, [order])

  const renderProgressBar = () => {

    if (completed) {
      return <ProgressBar variant="completed" value={0} max={100} desc={"Payment Completed"} counter=" " />
    }

    if (expired) {
      return <ProgressBar variant="expired" value={0} max={100} desc={"Payment Expired"} counter=" " />
    }


    const max = Math.floor((order.deadline - order.timestamp) / 1000)
    const [mins, secs] = ticks.split(':').map(v => parseInt(v))
    const value = (mins * 60 + secs)

    return (
      <ProgressBar 
        variant={error? 'error' : 'default'} 
        value={value} 
        max={max} 
        desc={error? 'Error' : "Payment awaiting"} 
        counter={ticks} 
      />
    )
  }

  if (loadingOrder) {
    return (
      <Heading>
        Loading order
      </Heading>
    )
  }

  if (order === undefined) {
    return <NotFound/>
  }

  const renderPage = () => {
    switch (page) {
      case PageType.COPY:
        return (
          <Flex sx={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <Text 
              style={{ boxSizing: 'border-box' }} 
              sx={{ 
                width: '80%', 
                textAlign: 'center', 
                overflowWrap: 'break-word' 
              }}
            >
              {order.address}
            </Text>
            
            <br/>
            <CopyToClipboard toCopy={order.address} />
          </Flex>
        )
      default:
      case PageType.SCAN: {
        return (
          <QRCode value={genPaymentLink(order.address, left)}/>
        )
      }
    }
  }

  return (
    <>
      <Flex sx={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100vh' }}>
        <PaymentCard>

          <Flex sx={{ height: '50px', justifyContent: 'center', alignItems: 'center' }}>
            <Heading sx={{ fontStyle: '' }} as="h3">ApeShift #{order.id}</Heading>
          </Flex>

          {renderProgressBar()}
          
          <Flex py={2} px={2} sx={{ height: '50px', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text>Pay with</Text>

            <Flex sx={{ textAlign: 'right', flexDirection: 'column', justifyContent: 'right' }}>
              <Text>{currency.name}</Text>
              <Text><small>{currency.network}</small></Text>
            </Flex>
          </Flex>
          <Divider color="grey" m={0}/>


          <Flex py={2} px={2} sx={{ height: '50px', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text>{order.item.name}</Text>

            <Flex sx={{ textAlign: 'right', flexDirection: 'column', justifyContent: 'right' }}>
              <Text>{order.payment.total} {currency.symbol.toUpperCase()}</Text>
              <Text><small>1 {currency.symbol.toUpperCase()} ~ {rate} $</small></Text>
            </Flex>
          </Flex>
          <Divider color="grey" m={0}/>

          <Flex py={2} px={2} sx={{ height: '50px', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text>Received</Text>
            <Flex sx={{ textAlign: 'right', flexDirection: 'column', justifyContent: 'right' }}>
              <Text>{(parseFloat(payment?.confirmed))} {currency.symbol.toUpperCase()}</Text>
              <Text><small>(pending: {payment?.unconfirmed})</small></Text>
            </Flex>
            
          </Flex>
          <Divider color="grey" m={0}/>
          <Flex py={2} px={2} sx={{ height: '50px', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text>Need to send</Text>
            <Text>{left} {currency.symbol.toUpperCase()}</Text>
          </Flex>
          <Divider color="grey" m={0}/>
          

          <NavItems>
            <NavItem active={page === PageType.SCAN} onClick={() => setPage(PageType.SCAN)} p={2}>
              Scan
            </NavItem>
            <NavItem active={page === PageType.COPY} onClick={() => setPage(PageType.COPY)} p={2}>
              Copy
            </NavItem>
          </NavItems>

          <Flex p={2} sx={{ bg: 'grey', width: "100%", flexDirection: 'column', position: 'relative', alignItems: 'center', justifyContent: "center", height: '100%' }}>
            <Flex sx={{ justifyContent: 'center', flexDirection: 'column' }}>
              {renderPage()}
            </Flex>
            <Button 
              onClick={() => {
                //@ts-ignore 
                window.location = genPaymentLink(order.address, left)
              }}
              sx={{ width: '80%', bg: 'green' }} 
              mt={4} 
              mb={2} 
            >
              Open wallet
            </Button>
            <Link to="/">Back</Link>
          </Flex>
        </PaymentCard>
          
        
      </Flex>
      
    </>
  );
}
  

/*
const TEST_completePayment = async (delay_msec: number, order: any) => {
  const { data } = await axios.post('http://localhost:3000/test/completePayment', {
    task_id: order.task_id,
    delay_msec
  })

  console.log(data)
}

const TEST_partialPayment = async (delay_msec: number, amount: string, order: any) => {
  const { data } = await axios.post('http://localhost:3000/test/partialPayment', {
    task_id: order.task_id,
    delay_msec,
    amount
  })
}


<Box pt={4} mt={4}>
  <Button 
    mr={2}
    onClick={() => TEST_completePayment(3000, order)} 
    variant="secondary"
  >
    TEST_PAY (in 3 secs)
  </Button>
  
  <Button 
    
    onClick={() => TEST_partialPayment(3000, (parseFloat(order.payment.total) / 2).toFixed(8), order)} 
    variant="secondary"
  >
    TEST_PAY 50% (in 3 secs)
  </Button>
</Box>
*/