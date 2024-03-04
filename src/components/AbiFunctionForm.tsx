import React, { FC, useCallback, useMemo } from 'react'
import { z } from 'zod'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Abi, AbiFunction, AbiType, Address } from 'abitype'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PublicClient, formatEther, parseEther } from 'viem'
import {
  SOLVER_ADDRESS,
  TESTNET_SOLVER_ADDRESS,
  mapAbiTypeToZod,
} from '@/lib/constants'
import { Execute, RelayChain } from '@reservoir0x/relay-sdk'
import { useAccount, useBalance, useConfig, useWalletClient } from 'wagmi'
import { useRelayClient, useTransactionModal } from '@/hooks'
import { switchChain } from 'wagmi/actions'
import useSolverCapacity from '@/hooks/useSolverCapacity'
import { ConnectButton } from '@rainbow-me/rainbowkit'

type AbiFunctionFormProps = {
  abiFunction: AbiFunction
  destinationChain: RelayChain
  paymentChain: RelayChain
  publicClient: PublicClient
  abi: Abi
  contract: Address
}

export const AbiFunctionForm: FC<AbiFunctionFormProps> = ({
  abiFunction,
  destinationChain,
  paymentChain,
  publicClient,
  abi,
  contract,
}) => {
  const { address, chainId: activeWalletChainId, isDisconnected } = useAccount()
  const { data: wallet } = useWalletClient()
  const relayClient = useRelayClient()
  const wagmiConfig = useConfig()
  const { isOpen, setIsOpen, setStepData, setError } = useTransactionModal()
  const { data: solverCapacity } = useSolverCapacity(
    paymentChain.id,
    destinationChain.id
  )
  const { data: balance } = useBalance({
    chainId: paymentChain.id,
  })

  const inputSchemas = useMemo(() => {
    const schemas = abiFunction.inputs.reduce((acc, input) => {
      if (input.name) {
        const validator = mapAbiTypeToZod(input.type as AbiType)
        acc[input.name] = validator
      }
      return acc
    }, {} as Record<string, ReturnType<typeof mapAbiTypeToZod>>)

    // If the function is payable, add 'value' to the schema
    if (abiFunction.stateMutability === 'payable') {
      schemas['value'] = z.string().min(1, 'Value is required')
    }

    return schemas
  }, [abiFunction.inputs, abiFunction.stateMutability])

  const schema = z.object(inputSchemas)
  const formAbiFunctions = useForm({
    resolver: zodResolver(schema),
  })

  type FormData = z.infer<typeof schema>

  // @TODO: simplify and clean up
  const handleSubmit = useCallback(
    async (data: FormData) => {
      console.log(`${abiFunction.name} called with:`, data)

      setError(null)

      const { value, ...argsData } = data

      const args = abiFunction.inputs.map((input) => {
        if (input.name) {
          const inputValue = argsData[input.name]
          if (
            (input.type.includes('[]') || input.type === 'tuple') && // @TODO: add zod validation for arrays and tuples
            typeof inputValue === 'string'
          ) {
            return inputValue.split(',').map((item) => item.trim())
          }
          return inputValue
        }
      })

      if (!wallet || !relayClient || !address) {
        throw Error('Missing wallet or Relay client')
      }

      if (paymentChain.id !== activeWalletChainId) {
        await switchChain(wagmiConfig, {
          chainId: paymentChain.id,
        })
      }

      try {
        setIsOpen(true)

        // Verify the solver has enough capacity for the request
        if (
          solverCapacity?.solver?.capacityPerRequest &&
          BigInt(solverCapacity?.solver?.capacityPerRequest) <
            parseEther(value as string)
        ) {
          throw Error(
            `Value exceeds the current solver's capacity per request:  ${formatEther(
              BigInt(solverCapacity?.solver?.capacityPerRequest)
            )} ETH`
          )
        }

        const { request } = await publicClient.simulateContract({
          address: contract,
          abi,
          account:
            (solverCapacity?.solver?.address as Address) ??
            TESTNET_SOLVER_ADDRESS,
          functionName: abiFunction.name,
          args: args,
          value: value ? parseEther(value as string) : undefined,
          chain: destinationChain.viemChain,
        })

        console.log(request)

        // Get quote for tx
        const quote = (await relayClient?.methods.getCallQuote({
          txs: [{ ...request, args: request.args as readonly unknown[] }],
          chainId: paymentChain.id,
          toChainId: destinationChain.id,
          wallet,
        })) as Execute

        const originGasFee = BigInt(quote.fees?.gas ?? 0)

        if (balance && balance?.value < originGasFee + BigInt(value)) {
          throw Error(
            'Not enough balance on payment chain. Value + gas exceeds balance.'
          )
        }

        // Execute action
        await relayClient?.actions
          .call({
            txs: [{ ...request, args: request.args as readonly unknown[] }],
            chainId: paymentChain.id,
            toChainId: destinationChain.id,
            wallet,
            onProgress: (steps) => {
              console.log('steps: ', steps)
              setStepData(steps)
            },
          })
          .catch((error) => {
            if (error?.message?.includes('rejected')) {
              //@TODO: improve rejection detection
              setIsOpen(false)
            } else {
              setError(error)
            }
          })
      } catch (error) {
        console.error(error)
        let errorMessage = 'Error simulating contract call'
        if (error instanceof Error) {
          setError(error)
        } else if (typeof error === 'string') {
          errorMessage = error
          setError(new Error(errorMessage))
        }
      }
    },
    [
      abiFunction.name,
      abiFunction.inputs,
      wallet,
      relayClient,
      address,
      paymentChain.id,
      activeWalletChainId,
      wagmiConfig,
      solverCapacity?.solver?.capacityPerRequest,
      solverCapacity?.solver?.address,
      publicClient,
      contract,
      abi,
      destinationChain.viemChain,
      destinationChain.id,
      balance,
      setStepData,
      setError,
      setIsOpen,
    ]
  )

  return (
    <FormProvider {...formAbiFunctions}>
      <form
        onSubmit={formAbiFunctions.handleSubmit(handleSubmit)}
        className="p-2 flex flex-col w-full gap-2"
      >
        {abiFunction.inputs.length > 0
          ? abiFunction.inputs.map((input, index) => {
              const isArrayOrTupple =
                input.type.includes('[]') || input.type === 'tuple'
              const placeholder = isArrayOrTupple
                ? `${input.type} (separate by commas)`
                : input.type
              return (
                <FormField
                  key={index}
                  control={formAbiFunctions.control}
                  name={input.name ?? 'Unknown input name'}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-x-5">
                      <FormLabel className="flex shrink-0">
                        {input.name} ({input.type})
                      </FormLabel>
                      <div className="flex flex-col w-full gap-2">
                        <FormControl>
                          <Input placeholder={placeholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              )
            })
          : null}
        {abiFunction.stateMutability === 'payable' && (
          <FormField
            control={formAbiFunctions.control}
            name="value"
            render={({ field }) => (
              <FormItem className="flex items-center gap-x-5">
                <FormLabel className="flex shrink-0">Value (ETH)</FormLabel>
                <div className="flex flex-col w-full gap-2">
                  <FormControl>
                    <Input placeholder="uint256" {...field} />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        )}

        {isDisconnected ? (
          <ConnectButton />
        ) : (
          <Button type="submit" className="w-max" disabled={!address || isOpen}>
            Call {abiFunction.name}
          </Button>
        )}
      </form>
    </FormProvider>
  )
}
