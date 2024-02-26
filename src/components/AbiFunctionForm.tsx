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
import { Chain, PublicClient, parseEther, zeroAddress } from 'viem'
import { typeToValidator } from '@/lib/constants'
import { RelayChain } from '@reservoir0x/relay-sdk'
import { useAccount, useConfig, useWalletClient } from 'wagmi'
import { useRelayClient, useTransactionModal } from '@/hooks'
import { switchChain } from 'wagmi/actions'

type AbiFunctionFormProps = {
  abiFunction: AbiFunction
  toChain: RelayChain
  paymentChain: RelayChain
  publicClient: PublicClient
  wagmiChain: Chain
  abi: Abi
  contract: Address
}

export const AbiFunctionForm: FC<AbiFunctionFormProps> = ({
  abiFunction,
  toChain,
  paymentChain,
  publicClient,
  wagmiChain,
  abi,
  contract,
}) => {
  const { address, chainId: activeWalletChainId } = useAccount()
  const { data: wallet } = useWalletClient()
  const relayClient = useRelayClient()
  const { isOpen, setIsOpen, setStepData, setError } = useTransactionModal()
  const wagmiConfig = useConfig()

  // Create a schema for each input
  const inputSchemas = abiFunction.inputs.reduce((acc, input) => {
    if (input.name) {
      acc[input.name] =
        typeToValidator[input.type] ||
        z.string().min(1, `${input.name} is required`)
    }
    return acc
  }, {} as Record<string, z.ZodTypeAny>)

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

    // Remove 'value' from data to separate it from args
    const { value, ...argsData } = data

    // Construct the args array from the form data
    const args = abiFunction.inputs.map(
      (input) => argsData[input.name as string]
    )

    setError(null)

    if (!wallet || !relayClient || !address) {
      console.error('Missing wallet or relay client')
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
        account: address, //zeroAddress, // @TOOD: should be the solver's address
        functionName: abiFunction.name,
        args: args ?? [],
        value: value ? parseEther(value) : undefined,
        chain: wagmiChain,
      })

      console.log(request)

      // Ensure `args` is always an array when passing to relayClient
      const relayRequest = {
        ...request,
        args: request.args || [],
        // address: address, // make sure the all transactions go to correct address
      }

      await relayClient?.actions
        .call({
          txs: [relayRequest],
          chainId: paymentChain.id,
          toChainId: toChain.id,
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

      // setError(error)
      // @TODO set error
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

        <Button type="submit" className="w-max">
          Call {abiFunction.name}
        </Button>
      </form>
    </FormProvider>
  )
}
