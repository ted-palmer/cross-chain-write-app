import { ThemeToggle } from './ThemeToggle'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/common/icons'

export const Navbar = () => {
  return (
    <div className="w-full flex justify-between items-center py-4">
      <a
        className="hidden sm:flex place-items-center gap-2"
        href="https://docs.relay.link/what-is-relay"
        target="_blank"
        rel="noopener noreferrer"
      >
        Powered By{' '}
        <Icons.Relay className="w-[100px] h-auto transition duration-150 ease-in-out hover:scale-[1.05]" />
      </a>
      <div className="flex gap-3 w-full sm:w-max justify-end">
        <ThemeToggle />
        <a
          href="https://github.com/ted-palmer/cross-chain-write-app"
          target="_blank"
        >
          <Button variant="outline" size="icon">
            <Icons.gitHub className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        </a>
        <ConnectButton
          chainStatus={{ smallScreen: 'none', largeScreen: 'full' }}
          accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }}
        />
      </div>
    </div>
  )
}
