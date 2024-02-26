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
          <Button variant="outline" className="gap-2 w-[200px]">
            <ChainIcon chainId={selectedChain.id} />
            {selectedChain.displayName}
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
