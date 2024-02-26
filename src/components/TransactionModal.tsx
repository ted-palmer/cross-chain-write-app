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

export const TransactionModal: FC = () => {
  const { isOpen, setIsOpen, stepData, setStepData } = useTransactionModal()

  const [currentStep, currentStepItem] = useMemo(() => {
    if (stepData) {
      let currentStep: NonNullable<Execute['steps']>['0'] | null = null
      let currentStepItem:
        | NonNullable<Execute['steps'][0]['items']>[0]
        | undefined

      for (const step of stepData) {
        for (const item of step.items || []) {
          if (item.status === 'incomplete') {
            currentStep = step
            currentStepItem = item
            break // Exit the inner loop once the first incomplete item is found
          }
        }
        if (currentStep && currentStepItem) break // Exit the outer loop if the current step and item have been found
      }
      return [currentStep, currentStepItem]
    }
    return [null, null]
  }, [stepData])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          console.log('setting step data to undefined')
          setStepData(undefined)
        }
        setIsOpen(open)
      }}
    >
      <DialogContent className="">
        {!stepData ? (
          <>
            <DialogHeader className="justify-center">
              <DialogDescription className="text-center items-center">
                Loading...
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
            <Button
              onClick={() => {
                setIsOpen(false)
                setStepData(undefined)
                console.log('resetting step data')
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
