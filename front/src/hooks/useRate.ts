import { SERVER_URL } from '@src/config'
import useRequest from './useRequest'
import useRefresh from './useRefresh'

const useRate = () => {
  const { fastRefresh } = useRefresh()
  const { result } = useRequest<number>(`${SERVER_URL}/price`, {
    normalize: v => v.USD,
    depends: [ fastRefresh ]
  })
  return { rate: result }
}

export default useRate