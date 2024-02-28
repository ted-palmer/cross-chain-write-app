import { paths, setParams } from '@reservoir0x/relay-sdk'
import { useRelayClient } from '@/hooks'
import { zeroAddress } from 'viem'
import { useQuery } from '@tanstack/react-query'

type SolverCapacityResponse =
  paths['/config']['get']['responses']['200']['content']['application/json']

export default function useSolverCapacity(
  fromChainId?: number,
  toChainId?: number
) {
  const client = useRelayClient()
  const params: paths['/config']['get']['parameters']['query'] = {
    originChainId: `${fromChainId}`,
    destinationChainId: `${toChainId}`,
    currency: zeroAddress,
    user: zeroAddress,
  }
  const url = new URL(`${client?.baseApiUrl}/config`)

  setParams(url, params)

  return useQuery<SolverCapacityResponse>({
    queryKey: [url, params],
    enabled: Boolean(fromChainId && toChainId),
    retry: 0,
    refetchOnMount: false,
    retryOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    queryFn: () =>
      fetch(url).then((res) => {
        if (!res.ok) {
          throw new Error(
            res.statusText ||
              'An error occurred while fetching the solver capacity.'
          )
        }
        return res.json()
      }),
  })
}
