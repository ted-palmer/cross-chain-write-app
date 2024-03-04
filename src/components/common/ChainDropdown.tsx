import { FC, ReactNode } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import ChainIcon from '@/components/common/ChainIcon'
import { RelayChain } from '@reservoir0x/relay-sdk'
import { ChevronDown } from 'lucide-react'

type ChainDropdownProps = {
  trigger?: ReactNode
  chains: RelayChain[]
  selectedChain: RelayChain
  onSelect: (chain: RelayChain) => void
}

export const ChainDropdown: FC<ChainDropdownProps> = ({
  trigger,
  chains,
  selectedChain,
  onSelect,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="outline"
            className="flex items-center justify-between gap-2 sm:w-[180px] shrink-0"
          >
            <div className="flex items-center gap-2">
              <ChainIcon chainId={selectedChain.id} />
              <span className="hidden sm:flex">
                {selectedChain.displayName}
              </span>
            </div>
            <ChevronDown className="w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {chains?.map((chain) => (
          <DropdownMenuItem
            onClick={() => onSelect(chain)}
            key={chain.id}
            className="gap-2"
          >
            <ChainIcon chainId={chain.id} />
            {chain.displayName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
