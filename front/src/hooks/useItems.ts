import { CURRENCY, SERVER_URL } from '@src/config'
import useRequest from './useRequest'
import useRate from './useRate'

const useItems = () => {
  const { rate } = useRate()
  const { result } = useRequest<any[]>(`${SERVER_URL}/items`, 
    { 
      normalize: arr => arr.items.map((v: any) => ({
        ...v,
        price: {
          ...v.price,
          [CURRENCY as string]: rate? v.price.USD / rate : null
        }
      })),
      defaultResult: [],
      depends: [rate]
    })

  return { items: result }
}

export default useItems