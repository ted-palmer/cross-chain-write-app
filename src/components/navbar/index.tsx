import { ThemeToggle } from './ThemeToggle'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { RelayLogo } from '../common/RelayLogo'

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
        <RelayLogo className="w-[100px] h-auto transition duration-150 ease-in-out hover:scale-[1.05]" />
      </a>
      <div className="flex gap-4 w-full justify-between sm:w-max">
        <ThemeToggle />
        <ConnectButton
          chainStatus={{ smallScreen: 'none', largeScreen: 'full' }}
          accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }}
        />
      </div>
    </div>
  )
}
