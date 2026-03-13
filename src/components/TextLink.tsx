import Link from 'next/link'
import { cn } from '@/lib/utils'
import { textButtonStyles, type TextButtonVariants } from './text-button-styles'

interface TextLinkProps
  extends
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className'>,
    TextButtonVariants {
  href: string
  children: React.ReactNode
  className?: string
}

export function TextLink({
  href,
  intent,
  className,
  children,
  ...props
}: TextLinkProps) {
  return (
    <Link
      href={href}
      className={cn(textButtonStyles({ intent }), className)}
      {...props}
    >
      {children}
    </Link>
  )
}
