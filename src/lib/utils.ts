import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import * as allChains from 'viem/chains'
import { getClient } from '@reservoir0x/relay-sdk'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensure that an Ethereum address does not overflow
 * by removing the middle characters
 * @param address An Ethereum address
 * @param shrinkInidicator Visual indicator to show address is only
 * partially displayed
 * @returns A shrinked version of the Ethereum address
 * with the middle characters removed.
 */
export function truncateAddress(address?: string, shrinkInidicator?: string) {
  return address
    ? address.slice(0, 4) + (shrinkInidicator || '…') + address.slice(-4)
    : address
}

export const getChainBlockExplorerUrl = (chainId?: number) => {
  if (chainId === 999) {
    return allChains.zoraTestnet.blockExplorers.default.url
  }
  return (
    getClient().chains.find((chain) => chain.id === chainId)?.viemChain
      ?.blockExplorers?.default?.url || 'https://etherscan.io'
  )
}
