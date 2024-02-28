import '@/styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import type { AppProps } from 'next/app'
import {
  getDefaultConfig,
  RainbowKitProvider,
  lightTheme,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { RelayClientProvider } from '@/components/providers/RelayClientProvider'
import { MainnetChains } from '@/lib/constants'
import {
  LogLevel,
  MAINNET_RELAY_API,
  convertViemChainToRelayChain,
} from '@reservoir0x/relay-sdk'
import { TransactionModalProvider } from '@/components/providers/TransactionModalProvider'

const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ''

const wagmiConfig = getDefaultConfig({
  appName: 'Relay Contract Viewer',
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: MainnetChains,
  ssr: true,
})

const queryClient = new QueryClient()

function App({ Component, pageProps }: AppProps) {
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
          <RainbowKitProvider
            theme={lightTheme({
              accentColor: 'hsl(262.1 83.3% 57.8%)',
              borderRadius: 'small',
            })}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TransactionModalProvider>
                <Component {...pageProps} />
              </TransactionModalProvider>
            </ThemeProvider>
          </RainbowKitProvider>
        </RelayClientProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
