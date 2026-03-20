import { cva, type VariantProps } from 'class-variance-authority'

export const textButtonStyles = cva(
  'no-underline cursor-pointer font-semibold transition-all hover:underline hover:[text-decoration-thickness:2px]',
  {
    variants: {
      intent: {
        primary: 'text-brand hover:text-brand',
        danger: 'text-red-600 hover:text-red-700',
        defaultText: 'foreground hover:foreground',
        mutedText: 'text-muted hover:text-muted',
      },
    },
    defaultVariants: {
      intent: 'primary',
    },
  },
)

export type TextButtonVariants = VariantProps<typeof textButtonStyles>
