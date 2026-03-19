import Link from 'next/link'
import { icons } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'
import { buttonBaseClasses, buttonIntentClasses } from './button-styles'

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

export function Button({
  href,
  intent = 'primary',
  icon,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const classes = cn(buttonBaseClasses, buttonIntentClasses[intent], className)
  const Icon = icon
    ? (
        icons as Record<
          string,
          React.ComponentType<{ className?: string; size?: number }>
        >
      )[kebabToPascal(icon)]
    : null

  const content = (
    <div className="flex items-start gap-2">
      {Icon && <Icon className="inline-block shrink-0 mt-1" size={20} />}
      {children}
    </div>
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
