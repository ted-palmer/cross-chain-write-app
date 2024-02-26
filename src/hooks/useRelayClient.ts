import { RelayClientContext } from '../components/providers/RelayClientProvider'
import { useContext } from 'react'

export default function useRelayClient() {
  return useContext(RelayClientContext)
}
