import { useEffect, useState } from 'react'
import axios from 'axios'

type RequestOptions<T> = {
  normalize?: (v: any) => T,
  onSuccess?: (v: T) => void
  onError?: (exc: any) => void,
  defaultResult?: T | null,
  depends?: any[]
}

const default_options = <T>() => ({
  onSuccess: (v: T) => {}, 
  onError: (exc: T) => console.log(exc),
  defaultResult: null,
  depends: []
})

const useRequest = <T = any>(
  url: string,
  options: RequestOptions<T> = default_options<T>()
) => {

  const { onSuccess, onError, normalize, defaultResult, depends } = {
    ...default_options,
    ...options
  }

  const [loading, setLoading] = useState<boolean>(false) 
  const [result, setResult] = useState<T | null | undefined>(defaultResult)

  const fetch = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(url)
      const normalized = normalize? normalize(data) : data

      setResult(normalized)
      onSuccess && onSuccess(normalized)
    }
    catch (exc) {
      onError && onError(exc)
    }
    finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetch()
  }, depends)

  return { result, loading }
}

export default useRequest