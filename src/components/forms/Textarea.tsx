import { cn } from '@/lib/utils'
import { FieldError } from './FieldError'

const textareaBase = cn(
  'w-full rounded-lg border border-border bg-background px-3 py-2',
  'text-base text-foreground placeholder:text-subtle',
  'focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand',
)

type Props = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  label: string
  name: string
  errors?: string[]
  description?: string
}

export function Textarea({
  label,
  name,
  errors,
  description,
  className,
  ...rest
}: Props) {
  const inputId = `field-${name}`
  const errorId = `${inputId}-error`
  const descId = description ? `${inputId}-desc` : undefined
  const hasError = !!errors?.length

  const describedBy =
    [hasError && errorId, descId].filter(Boolean).join(' ') || undefined

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold text-foreground"
      >
        {label}
        {rest.required && <span className="text-error"> *</span>}
      </label>
      <textarea
        id={inputId}
        name={name}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        className={cn(textareaBase, hasError && 'border-error', className)}
        {...rest}
      />
      {description && (
        <p id={descId} className="mt-1 text-sm text-muted">
          {description}
        </p>
      )}
      <FieldError id={errorId} errors={errors} />
    </div>
  )
}
