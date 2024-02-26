import { ExternalLinkIcon } from 'lucide-react'
import { FC } from 'react'

type ExternalLinkProps = {
  href: string
  text: string
}

export const ExternalLink: FC<ExternalLinkProps> = ({ href, text }) => {
  return (
    <a
      target="_blank"
      href={href}
      className="flex items-center text-xs gap-x-2 bg-muted rounded-full py-2 px-3 hover:opacity-90 w-max"
    >
      {text}
      <ExternalLinkIcon className="h-[.8rem] w-[.8rem]" />
    </a>
  )
}
