import { AbiType } from 'abitype'
import {
  base,
  baseSepolia,
  blastSepolia,
  holesky,
  mainnet,
  modeTestnet,
  optimism,
  sepolia,
  zkSync,
  zora,
  zoraSepolia,
} from 'viem/chains'
import { z } from 'zod'

export const ChainIdToBlockScoutBaseUrl: Record<number, string> = {
  // mainnets
  1: 'https://eth.blockscout.com',
  10: 'https://optimism.blockscout.com',
  324: 'https://zksync.blockscout.com',
  8453: 'https://base.blockscout.com',
  7777777: 'https://explorer.zora.energy',
  888888888: 'https://scan.ancient8.gg',

  // testnets
  84532: 'https://base-sepolia.blockscout.com',
  11155111: 'https://eth-sepolia.blockscout.com',
  999999999: 'https://sepolia.explorer.zora.energy',
  17000: 'https://eth-holesky.blockscout.com',
}

export const MainnetChains = [mainnet, optimism, base, zora, zkSync] as const

export const TestnetChains = [
  sepolia,
  baseSepolia,
  zoraSepolia,
  holesky,
] as const

export const TestnetPaymentChains = [
  sepolia,
  baseSepolia,
  zoraSepolia,
  holesky,
  blastSepolia,
  modeTestnet,
] as const

export const SOLVER_ADDRESS = '0xf70da97812cb96acdf810712aa562db8dfa3dbef'
export const TESTNET_SOLVER_ADDRESS =
  '0x3e34b27a9bf37D8424e1a58aC7fc4D06914B76B9'

// Zod Validators
const addressValidator = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address')

const intValidator = z // @TODO handle size validation
  .string()
  .regex(/^-?\d+$/, 'Invalid integer')
  .transform((value) => BigInt(value))

const uIntValidator = z // @TODO handle size validation
  .string()
  .regex(/^\d+$/, 'Invalid unsigned integer')
  .transform((value) => BigInt(value))

const bytesValidator = z // @TODO handle size validation
  .string()
  .regex(/^0x[a-fA-F0-9]+$/, 'Must be a valid hex string')

const booleanValidator = z
  .string()
  .regex(/^(true|false)$/i, 'Must be "true" or "false"')
  .transform((value) => value.toLowerCase() === 'true')

export const mapAbiTypeToZod = (abiType: AbiType) => {
  if (abiType === 'address') {
    return addressValidator
  } else if (abiType === 'bool') {
    return booleanValidator
  } else if (abiType.startsWith('int')) {
    return intValidator
  } else if (abiType.startsWith('uint')) {
    return uIntValidator
  } else if (abiType.startsWith('bytes')) {
    return bytesValidator
  } else if (abiType === 'string') {
    return z.string()
  }
  // @TODO: handle validation for arrays and tuples
  return z.any()
}
