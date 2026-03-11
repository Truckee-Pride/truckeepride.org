import { cva, type VariantProps } from 'class-variance-authority'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const actionButtonStyles = cva(
  'no-underline cursor-pointer font-semibold transition-all hover:underline hover:[text-decoration-thickness:2px]',
  {
    variants: {
      intent: {
        primary: 'text-brand hover:text-brand',
        danger: 'text-red-600 hover:text-red-700',
      },
    },
    defaultVariants: {
      intent: 'primary',
    },
  },
)

type ActionButtonVariants = VariantProps<typeof actionButtonStyles>

interface DashboardActionLinkProps
  extends
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className'>,
    ActionButtonVariants {
  href: string
  children: React.ReactNode
  className?: string
}

export function DashboardActionLink({
  href,
  intent,
  className,
  children,
  ...props
}: DashboardActionLinkProps) {
  return (
    <Link
      href={href}
      className={cn(actionButtonStyles({ intent }), className)}
      {...props}
    >
      {children}
    </Link>
  )
}

interface DashboardActionButtonProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'>,
    ActionButtonVariants {
  children: React.ReactNode
  className?: string
}

export function DashboardActionButton({
  intent,
  className,
  disabled,
  children,
  ...props
}: DashboardActionButtonProps) {
  return (
    <button
      className={cn(
        actionButtonStyles({ intent }),
        disabled && 'opacity-50 cursor-default hover:no-underline',
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
