import { FC, useEffect, useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '../ui/button'
import { AlertTriangle } from 'lucide-react'

export const Disclaimer: FC = ({}) => {
  const [isAccepted, setIsAccepted] = useState(true)

  useEffect(() => {
    const accepted = localStorage.getItem('contract-write-disclaimer-accepted')
    setIsAccepted(accepted === 'true')
  }, [])

  const acceptDisclaimer = () => {
    localStorage.setItem('contract-write-disclaimer-accepted', 'true')
    setIsAccepted(true)
  }
  return (
    <Dialog open={!isAccepted}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle />
            Disclaimer
          </DialogTitle>
          <DialogDescription>
            This is app is in beta. Please be careful and use at your own risk.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild onClick={acceptDisclaimer}>
            <Button type="button" variant="default" className="w-full">
              Continue
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
