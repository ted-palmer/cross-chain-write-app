import React, { FC } from 'react'
import { z } from 'zod'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Abi, AbiFunction, Address } from 'abitype'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PublicClient, parseEther } from 'viem'
import { ValidatorType, typeToValidator } from '@/lib/constants'
import { RelayChain } from '@reservoir0x/relay-sdk'
import { useAccount, useConfig, useWalletClient } from 'wagmi'
import { useRelayClient, useTransactionModal } from '@/hooks'
import { switchChain } from 'wagmi/actions'

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
  const { address, chainId: activeWalletChainId } = useAccount()
  const { data: wallet } = useWalletClient()
  const relayClient = useRelayClient()
  const wagmiConfig = useConfig()
  const { isOpen, setIsOpen, setStepData, setError } = useTransactionModal()

  // Create a schema for each input
  const inputSchemas = abiFunction.inputs.reduce((acc, input) => {
    if (input.name && typeToValidator[input.type]) {
      acc[input.name] = typeToValidator[input.type]
    } else if (input.name) {
      console.warn(
        `No validator found for type ${input.type}, using fallback string validator.`
      )
      acc[input.name] = z.string().min(1, `${input.name} is required`)
    }
    return acc
  }, {} as Record<string, ValidatorType>)

  // Check if the function is payable and add `value` to the schema if it is
  if (abiFunction.stateMutability === 'payable') {
    inputSchemas['value'] = z.string().min(1, 'Value is required')
  }

  const schema = z.object(inputSchemas)

  const formAbiFunctions = useForm({
    resolver: zodResolver(schema),
  })

  type FormData = z.infer<typeof schema>

  const handleSubmit = async (data: FormData) => {
    console.log(`${abiFunction.name} called with:`, data)

    const { value, ...argsData } = data

    const args = abiFunction.inputs.map((input) => {
      if (input.name) {
        return argsData[input.name]
      }
    })

    setError(null)

    if (!wallet || !relayClient || !address) {
      console.error('Missing wallet or Relay client')
      return
    }

    if (paymentChain.id !== activeWalletChainId) {
      await switchChain(wagmiConfig, {
        chainId: paymentChain.id,
      })
    }

    try {
      setIsOpen(true)
      const { request } = await publicClient.simulateContract({
        address: contract,
        abi,
        account: '0xf70da97812cb96acdf810712aa562db8dfa3dbef',
        functionName: abiFunction.name,
        args: args ?? ([] as readonly unknown[]),
        value: value ? parseEther(value as string) : undefined,
        chain: destinationChain.viemChain,
      })

      console.log(request)

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
            setIsOpen(false)
          } else {
            setError(error)
          }
        })
    } catch (error) {
      console.error('Error simulating contract:', error)
      let errorMessage = 'Error simulating contract call'
      if (error instanceof Error) {
        setError(error)
      } else if (typeof error === 'string') {
        errorMessage = error
        setError(new Error(errorMessage))
      }
    }
  }

  return (
    <FormProvider {...formAbiFunctions}>
      <form
        onSubmit={formAbiFunctions.handleSubmit(handleSubmit)}
        className="p-2 flex flex-col w-full gap-2"
      >
        {abiFunction.inputs.length > 0
          ? abiFunction.inputs.map((input, index) => (
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
                        <Input placeholder={input.type} {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            ))
          : null}
        {abiFunction.stateMutability === 'payable' && (
          <FormField
            control={formAbiFunctions.control}
            name="value"
            render={({ field }) => (
              <FormItem className="flex items-center gap-x-5">
                <FormLabel className="flex shrink-0">Value (ETH)</FormLabel>
                <FormControl>
                  <Input placeholder="uint256" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-max" disabled={!address || isOpen}>
          Call {abiFunction.name}
        </Button>
      </form>
    </FormProvider>
  )
}
