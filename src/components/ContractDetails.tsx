import { useContractDetails } from '@/hooks'
import { FC } from 'react'
import { Skeleton } from './ui/skeleton'
import { Alert, AlertTitle } from './ui/alert'
import { AlertOctagon } from 'lucide-react'

type ContractDetailsProps = {
  contract?: string
  chainId: number
}

export const ContractDetails: FC<ContractDetailsProps> = ({
  contract,
  chainId,
}) => {
  const {
    data: contractDetails,
    isLoading,
    isError,
  } = useContractDetails(chainId, contract)

  if (isLoading) {
    return <Skeleton className="h-[90px] w-full" />
  } else if (contractDetails)
    return (
      <div className="w-full border rounded-lg p-4 flex flex-col gap-4">
        <h6 className="font-bold">Contract Details</h6>
        <div className="flex justify-between flex-col gap-2 md:flex-row">
          <p>Contract Name: {contractDetails.name}</p>
          <p>Compiler Version: {contractDetails.compiler_version}</p>
          <p>Language: {contractDetails.language}</p>
        </div>
      </div>
    )
  else if (isError) {
    return (
      <Alert variant="destructive" className="w-full">
        <AlertOctagon className="h-4 w-4" />
        <AlertTitle className="mb-0">
          Failed to fetch contract details
        </AlertTitle>
      </Alert>
    )
  }
}
