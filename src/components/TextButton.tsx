import { cn } from '@/lib/utils'
import { textButtonStyles, type TextButtonVariants } from './text-button-styles'

interface TextButtonProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'>,
    TextButtonVariants {
  children: React.ReactNode
  className?: string
  ref?: React.Ref<HTMLButtonElement>
}

export function TextButton({
  intent,
  className,
  disabled,
  children,
  ref,
  ...props
}: TextButtonProps) {
  return (
    <button
      ref={ref}
      className={cn(
        textButtonStyles({ intent }),
        disabled && 'cursor-default opacity-50 hover:no-underline',
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
