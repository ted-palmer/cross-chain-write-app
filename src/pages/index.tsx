import { Inter } from 'next/font/google'
import { Navbar } from '@/components/navbar'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useDebounceValue } from 'usehooks-ts'
import { useGetContractAbi } from '@/hooks'
import { convertViemChainToRelayChain } from '@reservoir0x/relay-sdk'
import { baseSepolia } from 'viem/chains'
import { TestnetChains } from '@/lib/constants'
import { ChainDropdown } from '@/components/common/ChainDropdown'
import { AbiContainer } from '@/components/AbiContainer'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertOctagon } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [contract, setContract] = useState('')
  const [toChain, setToChain] = useState(
    convertViemChainToRelayChain(baseSepolia)
  )
  const [debouncedContract] = useDebounceValue(contract, 500)
  const {
    error,
    isError,
    data: abi,
    isLoading,
  } = useGetContractAbi(toChain.id, debouncedContract)

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between px-4 md:p-24 ${inter.className}`}
    >
      <div className="z-10 max-w-5xl w-full flex flex-col items-center justify-between text-sm gap-8">
        <Navbar />

        <div className="flex items-center w-full gap-2">
          <ChainDropdown
            chains={TestnetChains?.map((chain) =>
              convertViemChainToRelayChain(chain)
            )}
            selectedChain={toChain}
            onSelect={(chain) => setToChain(chain)}
          />
          <Input
            placeholder="Paste contract address"
            value={contract}
            onChange={(e) => setContract(e.target.value)}
          />
        </div>

        {isLoading ? 'Loading...' : null}
        {error ? (
          <Alert variant="destructive" className="w-full">
            <AlertOctagon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : null}

        {!isLoading && !error && !isError && abi ? (
          <AbiContainer abi={abi} contract={contract} toChain={toChain} />
        ) : (
          <div className="w-full flex flex-col items-center gap-8">
            <h3 className="text-lg text-center">
              Fetch the write parameters for any verified contract and execute
              transactions with Relay
            </h3>
          </div>
        )}
      </div>
    </main>
  )
}
