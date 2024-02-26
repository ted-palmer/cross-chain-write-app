import '@/styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import type { AppProps } from 'next/app'
import {
  getDefaultConfig,
  RainbowKitProvider,
  lightTheme,
  Chain,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { baseSepolia, sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { RelayClientProvider } from '@/components/providers/RelayClientProvider'
import {
  MainnetChains,
  TestnetChains,
  TestnetPaymentChains,
} from '@/lib/constants'
import {
  LogLevel,
  MAINNET_RELAY_API,
  TESTNET_RELAY_API,
  convertViemChainToRelayChain,
} from '@reservoir0x/relay-sdk'
import { TransactionModalProvider } from '@/components/providers/TransactionModalProvider'

const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ''

const wagmiConfig = getDefaultConfig({
  appName: 'Relay Contract Viewer',
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: [sepolia, ...TestnetPaymentChains],
  ssr: true,
})

const queryClient = new QueryClient()

function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RelayClientProvider
          options={{
            baseApiUrl: TESTNET_RELAY_API,
            chains: [
              ...TestnetPaymentChains.map((chain) =>
                convertViemChainToRelayChain(chain)
              ),
            ],
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
