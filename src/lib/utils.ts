import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { getClient } from '@reservoir0x/relay-sdk'
import { formatEther } from 'viem'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateAddress(address?: string, shrinkInidicator?: string) {
  return address
    ? address.slice(0, 4) + (shrinkInidicator || '…') + address.slice(-4)
    : address
}

export const getChainBlockExplorerUrl = (chainId?: number) => {
  return (
    getClient().chains.find((chain) => chain.id === chainId)?.viemChain
      ?.blockExplorers?.default?.url || 'https://etherscan.io'
  )
}

export function formatNumber(
  amount: number | null | undefined | string,
  maximumFractionDigits: number = 2,
  compact?: boolean
) {
  const { format } = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: maximumFractionDigits,
    notation: compact ? 'compact' : 'standard',
  })
  if (!amount) {
    return '-'
  }
  if (Number(amount) >= 1000000000) {
    return '>1B'
  }

  return format(+amount)
}

export const formatETHBalance = (
  balance: bigint | undefined,
  decimals = 5
): string => {
  if (balance === undefined) {
    return '-'
  }
  return `${formatNumber(formatEther(balance), decimals)} ETH`
}
