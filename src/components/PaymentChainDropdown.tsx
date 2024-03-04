import { FC } from 'react'
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
import { useAccount, useConfig } from 'wagmi'
import { useChainBalances } from '@/hooks/useChainBalances'
import { formatETHBalance } from '@/lib/utils'

type PaymentChainDropdown = {
  chains: RelayChain[]
  selectedChain: RelayChain
  onSelect: (chain: RelayChain) => void
}

export const PaymentChainDropdown: FC<PaymentChainDropdown> = ({
  chains,
  selectedChain,
  onSelect,
}) => {
  const config = useConfig()
  const { address } = useAccount()
  const chainBalancesMap = useChainBalances(config, chains, address)
  const selectedChainBalance = formatETHBalance(
    chainBalancesMap[selectedChain.id]
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-between gap-2 shrink-0 font-normal w-[240px] h-[48px]"
        >
          <div className="flex items-center gap-3">
            <ChainIcon chainId={selectedChain.id} width={20} height={20} />
            <div className="flex flex-col items-start">
              {selectedChain.displayName}
              <p className="text-muted-foreground text-xs">
                Balance: {selectedChainBalance}
              </p>
            </div>
          </div>
          <ChevronDown className="w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        {chains?.map((chain) => (
          <DropdownMenuItem
            onClick={() => onSelect(chain)}
            key={chain.id}
            className="gap-3 w-full"
          >
            <ChainIcon chainId={chain.id} width={20} height={20} />
            <div className="flex flex-col">
              {chain.displayName}
              <p className="text-muted-foreground text-xs">
                Balance: {formatETHBalance(chainBalancesMap[chain.id])}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
