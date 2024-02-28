import { Abi, AbiFunction, Address } from 'abitype'
import { FC, useMemo } from 'react'
import { RelayChain } from '@reservoir0x/relay-sdk'
import { AbiFunctionForm } from '@/components/AbiFunctionForm'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertOctagon } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion'
import { PublicClient, createPublicClient, http } from 'viem'
import { TransactionModal } from '@/components/TransactionModal'

type AbiContainerProps = {
  abi: Abi
  abiFunctions: AbiFunction[]
  contract: string
  destinationChain: RelayChain
  paymentChain: RelayChain
}

export const AbiContainer: FC<AbiContainerProps> = ({
  abi,
  abiFunctions,
  contract,
  destinationChain,
  paymentChain,
}) => {
  const publicClient = createPublicClient({
    chain: destinationChain.viemChain,
    transport: http(),
  })

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
                    paymentChain={paymentChain}
                    abiFunction={abiFunction}
                    destinationChain={destinationChain}
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
