import Link from 'next/link'
import { icons } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

/** Convert kebab-case icon name to PascalCase to look up in lucide-react's icons map */
function kebabToPascal(name: string) {
  return name.replace(/(^|-)([a-z])/g, (_, __, c: string) => c.toUpperCase())
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string
  intent?: 'primary' | 'secondary'
  icon?: string
  children: React.ReactNode
}

const baseClasses =
  'inline-block px-6 py-3 rounded-lg font-semibold text-xl transition-all duration-300 ease-out cursor-pointer no-underline hover:shadow-xl hover:-translate-y-1 disabled:opacity-50'

const intentClasses = {
  primary: 'bg-brand text-inverse hover:bg-brand-hover hover:text-inverse',
  secondary:
    'bg-secondary text-inverse hover:bg-secondary-hover hover:text-inverse',
}

export function Button({
  href,
  intent = 'primary',
  icon,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const classes = cn(baseClasses, intentClasses[intent], className)
  const Icon = icon
    ? (
        icons as Record<
          string,
          React.ComponentType<{ className?: string; size?: number }>
        >
      )[kebabToPascal(icon)]
    : null

  const content = (
    <>
      {Icon && <Icon className="inline-block mr-2 -mt-0.5" size={20} />}
      {children}
    </>
  )

  if (href) {
    const isExternal = href.startsWith('http')
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className={classes}>
          {content}
        </a>
      )
    }
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button className={classes} {...rest}>
      {content}
    </button>
  )
}
