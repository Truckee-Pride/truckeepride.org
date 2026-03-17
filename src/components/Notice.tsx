import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const noticeStyles = cva('mt-4 rounded-lg border px-4 py-3', {
  variants: {
    intent: {
      warning: 'bg-warning-bg border-warning-border text-warning',
      danger: 'bg-error-bg border-error-border text-error',
    },
  },
  defaultVariants: {
    intent: 'warning',
  },
})

type NoticeVariants = VariantProps<typeof noticeStyles>

interface NoticeProps extends NoticeVariants {
  children: React.ReactNode
  className?: string
}

export function Notice({ intent, className, children }: NoticeProps) {
  return (
    <div className={cn(noticeStyles({ intent }), className)}>{children}</div>
  )
}
