import '@/styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import type { AppProps } from 'next/app'
import {
  getDefaultConfig,
  RainbowKitProvider,
  lightTheme,
  darkTheme,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RelayClientProvider } from '@/components/providers/RelayClientProvider'
import { MainnetChains } from '@/lib/constants'
import {
  LogLevel,
  MAINNET_RELAY_API,
  convertViemChainToRelayChain,
} from '@reservoir0x/relay-sdk'
import { TransactionModalProvider } from '@/components/providers/TransactionModalProvider'
import { ThemeProvider, useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ''

const wagmiConfig = getDefaultConfig({
  appName: 'Relay Contract Viewer',
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: MainnetChains,
  ssr: true,
})

const queryClient = new QueryClient()

function AppWrapper(pageProps: AppProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RelayClientProvider
          options={{
            baseApiUrl: MAINNET_RELAY_API,
            chains: [
              ...MainnetChains.map((chain) =>
                convertViemChainToRelayChain(chain)
              ),
            ],
            pollingInterval: 2000,
            logLevel: LogLevel['Verbose'],
          }}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <App {...pageProps} />
          </ThemeProvider>
        </RelayClientProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

function App({ Component, pageProps }: AppProps) {
  const { theme } = useTheme()

  const [rainbowKitTheme, setRainbowKitTheme] = useState<
    ReturnType<typeof darkTheme> | ReturnType<typeof lightTheme>
  >()

  useEffect(() => {
    if (theme == 'dark') {
      setRainbowKitTheme(
        darkTheme({
          borderRadius: 'small',
          accentColor: 'hsl(262.1 83.3% 57.8%)',
        })
      )
    } else {
      setRainbowKitTheme(
        lightTheme({
          borderRadius: 'small',
          accentColor: 'hsl(262.1 83.3% 57.8%)',
        })
      )
    }
  }, [theme])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      value={{
        light: 'light',
      }}
    >
      <RainbowKitProvider theme={rainbowKitTheme}>
        <TransactionModalProvider>
          <Component {...pageProps} />
        </TransactionModalProvider>
      </RainbowKitProvider>
    </ThemeProvider>
  )
}

export default AppWrapper
