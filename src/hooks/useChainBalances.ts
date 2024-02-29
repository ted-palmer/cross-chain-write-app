import { RelayChain } from '@reservoir0x/relay-sdk'
import { useQueries } from '@tanstack/react-query'
import { Address } from 'viem'
import { Config } from 'wagmi'
import { getBalance } from 'wagmi/actions'

export const useChainBalances = (
  config: Config,
  chains: RelayChain[],
  address?: Address
) => {
  const chainBalanceQueries = useQueries({
    queries: chains.map((chain) => ({
      queryKey: ['chainBalance', chain.id, address],
      queryFn: async () => {
        const balance = await getBalance(config, {
          address: address as Address,
          chainId: chain.id,
        })
        return { chainId: chain.id, balance: balance.value }
      },
      placeholderData: { chainId: chain.id, balance: undefined },
      enabled: Boolean(address),
    })),
  })

  const balancesMap = chainBalanceQueries.reduce((acc, query) => {
    if (query.data) {
      acc[query.data.chainId] = query.data.balance
    }
    return acc
  }, {} as Record<number, bigint | undefined>)

  return balancesMap
}
