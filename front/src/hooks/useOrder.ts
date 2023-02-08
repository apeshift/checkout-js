import { SERVER_URL } from '@src/config'
import useRequest from './useRequest'

const useOrder = (id: string) => {

  const { result, loading } = useRequest<any>(`${SERVER_URL}/order/${id}`, 
    { 
      normalize: v => {
        return v.order
      },
      defaultResult: undefined,
      depends: []
    })

  return { order: result, loading }
}

export default useOrder