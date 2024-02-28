import useSolverCapacity from '@/hooks/useSolverCapacity'
import { FC } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatEther } from 'viem'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { InfoIcon } from 'lucide-react'

type SolverCapacityProps = {
  originChainId: number
  destinationChainId: number
}

export const SolverCapacity: FC<SolverCapacityProps> = ({
  originChainId,
  destinationChainId,
}) => {
  const { data: solverCapacity, isLoading } = useSolverCapacity(
    originChainId,
    destinationChainId
  )

  if (isLoading) {
    return <Skeleton className="h-[24px] w-[200px]" />
  } else if (solverCapacity?.solver?.capacityPerRequest)
    return (
      <h6 className="flex items-center gap-2">
        Capacity Per Request:{' '}
        {formatEther(BigInt(solverCapacity?.solver?.capacityPerRequest))} ETH
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="w-4 h-4" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-[200px]">
                The Relay Solver has limited capacity until more relayers are
                added to the network
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </h6>
    )
}
