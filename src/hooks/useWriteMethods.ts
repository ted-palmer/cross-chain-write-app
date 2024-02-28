import { ChainIdToBlockScoutBaseUrl } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import { Abi, isAddress } from 'viem'

export default function useWriteMethods(chainId: number, contract?: string) {
  const baseUrl = ChainIdToBlockScoutBaseUrl[chainId]
  const queryUrl = `${baseUrl}/api/v2/smart-contracts/${contract}/methods-write`
  return useQuery<Abi>({
    queryKey: [queryUrl],
    enabled: Boolean(contract && isAddress(contract) && queryUrl),
    retry: 0,
    refetchOnMount: false,
    retryOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    queryFn: () =>
      fetch(queryUrl).then((res) => {
        if (!res.ok) {
          throw new Error(
            res.statusText ||
              'An error occurred while fetching the ABI. Make sure the contract exists on the selected chain.'
          )
        }
        return res.json()
      }),
  })
}
