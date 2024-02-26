import { Execute } from '@reservoir0x/relay-sdk'
import React, {
  createContext,
  FC,
  ReactNode,
  useState,
  SetStateAction,
  Dispatch,
} from 'react'

export interface TransactionModalContextType {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  setStepData: (data?: Execute['steps']) => void
  stepData?: Execute['steps']
  error?: Error | null
  setError: React.Dispatch<React.SetStateAction<Error | null>>
}

export const TransactionModalContext = createContext<
  TransactionModalContextType | undefined
>(undefined)

interface TransactionModalProviderProps {
  children: ReactNode
}

export const TransactionModalProvider: FC<TransactionModalProviderProps> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [stepData, setStepData] = useState<Execute['steps']>()
  const [error, setError] = useState<Error | null>(null)

  return (
    <TransactionModalContext.Provider
      value={{ isOpen, setIsOpen, stepData, setStepData, error, setError }}
    >
      {children}
    </TransactionModalContext.Provider>
  )
}
