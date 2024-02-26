import { ChainIdToBlockScoutBaseUrl } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import { Abi, isAddress } from 'viem'

export default function useGetContractAbi(chainId: number, contract?: string) {
  const baseUrl = ChainIdToBlockScoutBaseUrl[chainId]
  return useQuery<Abi>({
    queryKey: [chainId, contract, baseUrl],
    enabled: Boolean(contract && isAddress(contract) && baseUrl),
    retry: 0,
    refetchOnMount: false,
    retryOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    queryFn: () =>
      fetch(`${baseUrl}/api/v2/smart-contracts/${contract}/methods-write`).then(
        (res) => {
          if (!res.ok) {
            throw new Error(
              res.statusText ||
                'An error occurred while fetching the ABI. Make sure the contract exists on the selected chain.'
            )
          }
          return res.json()
        }
      ),
  })
}
