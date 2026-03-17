import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string
  intent?: 'primary' | 'secondary'
  children: React.ReactNode
}

const baseClasses =
  'inline-block px-6 py-3 rounded-lg font-semibold text-xl transition-all duration-300 ease-out cursor-pointer no-underline hover:shadow-xl hover:-translate-y-1 disabled:opacity-50'

const intentClasses = {
  primary: 'bg-brand text-inverse hover:bg-brand-hover hover:text-inverse',
  secondary: 'bg-surface text-foreground hover:bg-border hover:text-foreground',
}

export function Button({
  href,
  intent = 'primary',
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const classes = cn(baseClasses, intentClasses[intent], className)

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
