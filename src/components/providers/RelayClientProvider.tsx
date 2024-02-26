import React, { createContext, FC, ReactNode, useState } from 'react'
import {
  RelayClientOptions,
  RelayClient,
  createClient,
} from '@reservoir0x/relay-sdk'
export interface RelayClientProviderProps {
  children: ReactNode
  options: RelayClientOptions
}

export const RelayClientContext = createContext<RelayClient | null>(null)

export const RelayClientProvider: FC<RelayClientProviderProps> = function ({
  children,
  options,
}: RelayClientProviderProps) {
  const [clientContext, _] = useState<RelayClient | null>(
    createClient({ ...options })
  )

  return (
    <RelayClientContext.Provider value={clientContext}>
      {children}
    </RelayClientContext.Provider>
  )
}
