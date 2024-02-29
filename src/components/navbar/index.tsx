import { useTheme } from 'next-themes'
import Image from 'next/image'
import { ThemeToggle } from './ThemeToggle'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react'

export const Navbar = () => {
  const { theme, systemTheme } = useTheme()
  const [imgSrc, setImgSrc] = useState('/relay-light.svg')
  const isDarkTheme =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark')

  useEffect(() => {
    setImgSrc(isDarkTheme ? '/relay-dark.svg' : '/relay-light.svg')
  }, [isDarkTheme])

  return (
    <div className="w-full flex justify-between items-center py-4">
      <a
        className="flex place-items-center gap-2 "
        href="https://docs.relay.link/what-is-relay"
        target="_blank"
        rel="noopener noreferrer"
      >
        Powered By{' '}
        <Image
          src={imgSrc}
          alt="Relay"
          width={100}
          height={24}
          className="transition duration-150 ease-in-out hover:scale-[1.05]"
        />
      </a>
      <div className="flex gap-4">
        <ThemeToggle />
        <ConnectButton
          chainStatus={{ smallScreen: 'none', largeScreen: 'full' }}
          accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }}
        />
      </div>
    </div>
  )
}
