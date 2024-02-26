import { TransactionModalContext } from '@/components/providers/TransactionModalProvider'
import { useContext } from 'react'

export default function useTransactionModal() {
  const context = useContext(TransactionModalContext)
  if (context === undefined) {
    throw new Error(
      'useTransactionModal must be used within a TransactionModalProvider'
    )
  }
  return context
}
