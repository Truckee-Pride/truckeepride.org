import Link from 'next/link'
import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string
  children: React.ReactNode
}

export function Button({
  href,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const classes = `inline-block px-6 py-3 rounded-lg font-semibold text-xl transition-all duration-300 ease-out cursor-pointer bg-brand text-inverse no-underline hover:bg-brand-hover hover:text-inverse hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 ${className}`

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
