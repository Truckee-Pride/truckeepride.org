'use client'

import { usePathname } from 'next/navigation'
import { TextLink } from '@/components/TextLink'
import { cn } from '@/lib/utils'
import type { TextButtonVariants } from './text-button-styles'

export type NavItem = {
  href: string
  label: string
}

type NavBarProps = {
  items: NavItem[]
  ariaLabel: string
  className?: string
  textClassName?: string
  activeIntent?: TextButtonVariants['intent']
  inactiveIntent?: TextButtonVariants['intent']
}

export function NavBar({
  items,
  ariaLabel,
  className,
  textClassName,
  activeIntent = 'defaultText',
  inactiveIntent = 'mutedText',
}: NavBarProps) {
  const pathname = usePathname()

  return (
    <nav aria-label={ariaLabel}>
      <ul
        role="list"
        className={cn('flex items-baseline gap-8 list-none m-0 p-0', className)}
      >
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <li key={item.href}>
              <TextLink
                href={item.href}
                intent={isActive ? activeIntent : inactiveIntent}
                className={textClassName}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </TextLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
