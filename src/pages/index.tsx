import { Inter } from 'next/font/google'
import { Navbar } from '@/components/navbar'
import { Input } from '@/components/ui/input'
import { useEffect, useMemo, useState } from 'react'
import { useDebounceValue } from 'usehooks-ts'
import { useWriteMethods, useRelayClient, useWriteProxyMethods } from '@/hooks'
import { convertViemChainToRelayChain } from '@reservoir0x/relay-sdk'
import { base, zora } from 'viem/chains'
import { MainnetChains } from '@/lib/constants'
import { ChainDropdown } from '@/components/common/ChainDropdown'
import { AbiContainer } from '@/components/AbiContainer'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertOctagon, Wallet } from 'lucide-react'
import { ContractDetails } from '@/components/ContractDetails'
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs'
import { TabsList } from '@radix-ui/react-tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { SolverCapacity } from '@/components/SolverCapacity'
import { AbiFunction } from 'abitype'
import { PaymentChainDropdown } from '@/components/PaymentChainDropdown'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const client = useRelayClient()
  const [contract, setContract] = useState('')
  const [tab, setTab] = useState<'write' | 'write-proxy'>('write')
  const [debouncedContract] = useDebounceValue(contract, 500)
  const [destinationChain, setDestinationChain] = useState(
    convertViemChainToRelayChain(base)
  )
  const [paymentChain, setPaymentChain] = useState(
    convertViemChainToRelayChain(zora)
  )

  const {
    error,
    data: writeMethodAbi,
    isLoading: writeMethodAbiIsLoading,
  } = useWriteMethods(destinationChain.id, debouncedContract)

  const { data: writeProxyMethodAbi, isLoading: writeProxyMethodAbiIsLoading } =
    useWriteProxyMethods(destinationChain.id, debouncedContract)

  const writeAbiFunctions = useMemo(() => {
    return writeMethodAbi?.filter(
      (abiFunction) => abiFunction.type === 'function'
    ) as AbiFunction[]
  }, [writeMethodAbi])

  const writeProxyAbiFunctions = useMemo(() => {
    return writeProxyMethodAbi?.filter(
      (abiFunction) => abiFunction.type === 'function'
    ) as AbiFunction[]
  }, [writeProxyMethodAbi])

  const hasWriteMethods = writeMethodAbi && writeAbiFunctions.length > 0
  const hasWriteProxyMethods =
    writeProxyMethodAbi && writeProxyAbiFunctions.length > 0

  const isLoading = writeMethodAbiIsLoading || writeProxyMethodAbiIsLoading

  const paymentChains = useMemo(() => {
    return (
      client?.chains.filter((chain) => chain.depositEnabled) ?? [
        destinationChain,
      ]
    )
  }, [client?.chains, destinationChain])

  // Handle setting active tab
  useEffect(() => {
    if (hasWriteMethods) {
      setTab('write')
    } else if (hasWriteProxyMethods) {
      setTab('write-proxy')
    }
  }, [hasWriteMethods, hasWriteProxyMethods])

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between px-4 md:p-24 ${inter.className}`}
    >
      <div className="z-10 max-w-5xl w-full flex flex-col  justify-between text-sm gap-8">
        <Navbar />
        <div className="flex items-center w-full gap-2">
          <ChainDropdown
            chains={MainnetChains?.map((chain) =>
              convertViemChainToRelayChain(chain)
            )}
            selectedChain={destinationChain}
            onSelect={(chain) => setDestinationChain(chain)}
          />
          <Input
            placeholder="Paste contract address"
            value={contract}
            onChange={(e) => setContract(e.target.value)}
          />
        </div>
        <div className="w-full flex flex-col gap-6 gap-3">
          <div className="flex items-center gap-2">
            <Wallet className="" />
            <h6 className="text-xl">Pay with</h6>
          </div>

          <PaymentChainDropdown
            selectedChain={paymentChain}
            chains={paymentChains}
            onSelect={(chain) => setPaymentChain(chain)}
          />
          <SolverCapacity
            originChainId={paymentChain.id}
            destinationChainId={destinationChain.id}
          />
        </div>

        <ContractDetails
          chainId={destinationChain.id}
          contract={debouncedContract}
        />

        {/* Loading */}
        {isLoading && <Skeleton className="h-[400px] w-full" />}

        {/* Error State */}
        {error ? (
          <Alert variant="destructive" className="w-full">
            <AlertOctagon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : null}

        {/* Tabs */}
        {!isLoading && !error && (hasWriteMethods || hasWriteProxyMethods) ? (
          <Tabs
            defaultValue="write"
            value={tab}
            onValueChange={(value) => setTab(value as typeof tab)}
          >
            <TabsList className="flex gap-4">
              {hasWriteMethods ? (
                <TabsTrigger value="write">Write</TabsTrigger>
              ) : null}

              {hasWriteProxyMethods ? (
                <TabsTrigger value="write-proxy">Write proxy</TabsTrigger>
              ) : null}
            </TabsList>
            <TabsContent value="write">
              {hasWriteMethods ? (
                <AbiContainer
                  abi={writeMethodAbi}
                  abiFunctions={writeAbiFunctions}
                  contract={contract}
                  destinationChain={destinationChain}
                  paymentChain={paymentChain}
                />
              ) : null}
            </TabsContent>
            <TabsContent value="write-proxy">
              {hasWriteProxyMethods ? (
                <AbiContainer
                  abi={writeProxyMethodAbi}
                  abiFunctions={writeProxyAbiFunctions}
                  contract={contract}
                  destinationChain={destinationChain}
                  paymentChain={paymentChain}
                />
              ) : null}
            </TabsContent>
          </Tabs>
        ) : null}

        {/* Empty State */}
        {!isLoading && !error && !writeMethodAbi && !writeProxyMethodAbi ? (
          <div className="w-full flex flex-col items-center gap-8">
            <h3 className="text-lg text-center">
              Fetch the write methods for any verified contract and pay with
              cross-chain ETH
            </h3>
          </div>
        ) : null}
      </div>
    </main>
  )
}
