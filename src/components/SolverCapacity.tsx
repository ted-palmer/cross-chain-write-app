import useSolverCapacity from '@/hooks/useSolverCapacity'
import { FC } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatEther } from 'viem'
import { InfoIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

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
    return <Skeleton className="h-[20px] w-[200px]" />
  } else if (solverCapacity?.solver?.capacityPerRequest)
    return (
      <h6 className="flex items-center gap-2">
        Capacity Per Request:{' '}
        {formatEther(BigInt(solverCapacity?.solver?.capacityPerRequest))} ETH
        <Popover>
          <PopoverTrigger>
            {' '}
            <InfoIcon className="w-4 h-4" />
          </PopoverTrigger>
          <PopoverContent side="top">
            <p className="max-w-[184px]">
              The{' '}
              <a
                href="https://docs.relay.link/what-is-relay"
                target="_blank"
                className="text-primary"
              >
                Relay Solver
              </a>{' '}
              has limited capacity until more relayers are added to the network
            </p>
          </PopoverContent>
        </Popover>
      </h6>
    )
}
