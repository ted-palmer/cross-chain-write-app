import { useTransactionModal } from '@/hooks'
import { FC, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Execute } from '@reservoir0x/relay-sdk'
import { Button } from '@/components/ui/button'
import { Address } from 'viem'
import { getChainBlockExplorerUrl, truncateAddress } from '@/lib/utils'

export const TransactionModal: FC = () => {
  const { isOpen, setIsOpen, stepData, setStepData, error } =
    useTransactionModal()

  const [currentStep, currentStepItem, txHashes] = useMemo(() => {
    if (stepData) {
      let currentStep: NonNullable<Execute['steps']>['0'] | null = null
      let currentStepItem:
        | NonNullable<Execute['steps'][0]['items']>[0]
        | undefined = undefined
      let txHashes: { txHash: Address; chainId: number }[] = []

      for (const step of stepData) {
        for (const item of step.items || []) {
          if (item.txHashes && item.txHashes.length > 0) {
            txHashes = item.txHashes.concat([...txHashes])
          }
          if (item.internalTxHashes && item.internalTxHashes.length > 0) {
            txHashes = item.internalTxHashes.concat([...txHashes])
          }
          if (item.status === 'incomplete') {
            currentStep = step
            currentStepItem = item

            break // Exit the inner loop once the first incomplete item is found
          }
        }
        if (currentStep && currentStepItem) break // Exit the outer loop if the current step and item have been found
      }
      return [currentStep, currentStepItem, txHashes]
    }
    return [null, null, null]
  }, [stepData])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setStepData(undefined)
        }
        setIsOpen(open)
      }}
    >
      <DialogContent className="">
        {!stepData && !error ? (
          <>
            <DialogHeader className="justify-center">
              <DialogDescription className="text-center items-center py-3">
                Loading...
              </DialogDescription>
            </DialogHeader>
          </>
        ) : null}
        {!stepData && error ? (
          <>
            <DialogHeader className="justify-center">
              <DialogTitle>{error?.name}</DialogTitle>
              <DialogDescription className="py-3">
                {error.message}
              </DialogDescription>
            </DialogHeader>
          </>
        ) : null}
        {currentStepItem?.status === 'incomplete' ? (
          <>
            <DialogHeader>
              <DialogTitle>{currentStep?.action}</DialogTitle>
              <DialogDescription>{currentStep?.description}</DialogDescription>
            </DialogHeader>
            <Button disabled>Waiting for confirmation...</Button>
          </>
        ) : null}
        {stepData && !currentStepItem ? (
          <>
            <DialogHeader>
              <DialogTitle>Transaction complete</DialogTitle>
              <DialogDescription>
                Your transaction went through successfully
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center py-2">
              {txHashes?.map(({ txHash, chainId }, idx) => {
                const blockExplorer = getChainBlockExplorerUrl(chainId)
                return (
                  <a
                    key={idx}
                    href={`${blockExplorer}/tx/${txHash}`}
                    target="_blank"
                    className="text-primary hover:opacity-9"
                  >
                    View Tx: {truncateAddress(txHash)}
                  </a>
                )
              })}
            </div>
            <Button
              onClick={() => {
                setIsOpen(false)
                setStepData(undefined)
              }}
            >
              Close
            </Button>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
