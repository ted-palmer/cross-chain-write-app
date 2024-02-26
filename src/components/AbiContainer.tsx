import { Abi, AbiFunction, Address } from 'abitype'
import { FC, useState } from 'react'
import { ExternalLink } from '@/components/common/ExternalLink'
import {
  ChainIdToBlockScoutBaseUrl,
  TestnetPaymentChains,
} from '@/lib/constants'
import {
  RelayChain,
  convertViemChainToRelayChain,
} from '@reservoir0x/relay-sdk'
import { AbiFunctionForm } from '@/components/AbiFunctionForm'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertOctagon, Wallet } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion'
import { PublicClient, createPublicClient, http } from 'viem'
import * as wagmiChains from 'wagmi/chains'
import { TransactionModal } from '@/components/TransactionModal'
import { ChainDropdown } from '@/components/common/ChainDropdown'
import { Button } from './ui/button'
import ChainIcon from './common/ChainIcon'

type AbiContainerProps = {
  abi: Abi
  contract: string
  toChain: RelayChain
}

export const AbiContainer: FC<AbiContainerProps> = ({
  abi,
  contract,
  toChain,
}) => {
  const [paymentChain, setPaymentChain] = useState<RelayChain>(
    convertViemChainToRelayChain(wagmiChains.sepolia)
  )
  const wagmiChain =
    Object.values(wagmiChains).find((chain) => chain.id === toChain.id) ??
    wagmiChains.mainnet

  const publicClient = createPublicClient({
    chain: wagmiChain,
    transport: http(),
  })

  const abiFunctions = abi.filter(
    (abiFunction) => abiFunction.type === 'function'
  ) as AbiFunction[]

  return (
    <div className="w-full flex flex-col gap-4">
      <Alert variant="default" className="w-full">
        <AlertOctagon className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Please confirm that the function you call does not rely on{' '}
          <pre className="inline-block bg-gray-800 text-white font-mono text-xs px-2 py-[1px] rounded-lg">
            msg.sender
          </pre>{' '}
          before submitting a transaction.
        </AlertDescription>
      </Alert>
      <ExternalLink
        text="View contract code on Blockscout"
        href={`${
          ChainIdToBlockScoutBaseUrl[toChain.id]
        }/address/${contract}?tab=contract`}
      />

      <ChainDropdown
        trigger={
          <Button variant="outline" className="gap-2 w-min">
            <Wallet />
            Pay with <ChainIcon chainId={paymentChain.id} />
            {paymentChain.displayName}
          </Button>
        }
        selectedChain={paymentChain}
        chains={TestnetPaymentChains.map((chain) =>
          convertViemChainToRelayChain(chain)
        )}
        onSelect={(chain) => setPaymentChain(chain)}
      />

      {abiFunctions?.length > 0 ? (
        <div className="rounded-lg border">
          <Accordion type="multiple" className="p-4">
            {abiFunctions.map((abiFunction, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{`${index + 1}. ${
                  abiFunction.name
                }`}</AccordionTrigger>
                <AccordionContent>
                  <AbiFunctionForm
                    key={index}
                    abi={abi}
                    contract={contract as Address}
                    wagmiChain={wagmiChain}
                    paymentChain={paymentChain}
                    abiFunction={abiFunction}
                    toChain={toChain}
                    publicClient={publicClient as PublicClient} // @TODO: fix PublicClient type
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ) : null}
      <TransactionModal />
    </div>
  )
}
