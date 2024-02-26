import React, { FC } from 'react'
import { useRelayClient } from '@/hooks'
import Image from 'next/image'
import { ClassNameValue } from 'tailwind-merge'

type Props = {
  chainId?: number
  height?: number
  width?: number
  className?: ClassNameValue
}

const ChainIcon: FC<Props> = ({
  chainId,
  className = {},
  height = 18,
  width = 18,
}) => {
  const client = useRelayClient()
  const icon = chainId
    ? client?.chains?.find((chain) => chain.id === chainId)?.icon?.light
    : null

  return icon ? (
    <div className="flex shrink-0" style={{ height: height, width: width }}>
      {icon ? (
        <Image
          src={icon}
          alt={`Chain #${chainId}`}
          style={{ width: '100%', height: '100%' }}
          width={width}
          height={height}
        />
      ) : null}
    </div>
  ) : null
}

export default ChainIcon
