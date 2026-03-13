import { cn } from '@/lib/utils'
import { textButtonStyles, type TextButtonVariants } from './text-button-styles'

interface TextButtonProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'>,
    TextButtonVariants {
  children: React.ReactNode
  className?: string
}

export function TextButton({
  intent,
  className,
  disabled,
  children,
  ...props
}: TextButtonProps) {
  return (
    <button
      className={cn(
        textButtonStyles({ intent }),
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
