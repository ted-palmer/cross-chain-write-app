import {
  Chain,
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

export const MainnetChains = [mainnet, optimism, base, zora, zkSync] as [
  Chain,
  ...Chain[]
]

export const TestnetChains = [sepolia, baseSepolia, zoraSepolia, holesky] as [
  Chain,
  ...Chain[]
]
export const TestnetPaymentChains = [
  sepolia,
  baseSepolia,
  zoraSepolia,
  holesky,
  blastSepolia,
  modeTestnet,
] as [Chain, ...Chain[]]

// Validators
const addressValidator = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address')
const uint256Validator = z
  .string()
  .regex(/^\d+$/, 'Must be a positive number')
  .transform(Number)

const uint8Validator = z
  .string()
  .regex(/^\d+$/, 'Must be a positive number')
  .transform(Number)

const bytes32Validator = z
  .string()
  .length(66, 'Must be 32 bytes in hex format')
  .regex(/^0x[a-fA-F0-9]{64}$/i, 'Invalid bytes32 format')

const boolValidator = z.boolean()

const int256Validator = z
  .string()
  .regex(/^-?\d+$/, 'Must be a number')
  .transform(Number)
  .refine(
    (num) => num >= -Math.pow(2, 255) && num < Math.pow(2, 255),
    'Must be within int256 range'
  )

// const addressArrayValidator = z.array(addressValidator) @TODO

export type ValidatorType =
  | z.ZodString
  | z.ZodEffects<z.ZodString, number, string>
  | z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>
  | z.ZodBoolean

// Map Solidity types to Zod validators
export const typeToValidator: {
  [type: string]: ValidatorType
} = {
  address: addressValidator,
  // 'address[]': addressArrayValidator, @TODO: more complicated
  uint256: uint256Validator,
  uint8: uint8Validator,
  int256: int256Validator,
  bytes32: bytes32Validator,
  bool: boolValidator,
}
