import { cn } from '@/lib/utils'
import { FieldError } from './FieldError'

const selectBase = cn(
  'w-full rounded-lg border border-border bg-background px-3 py-2',
  'text-base text-foreground',
  'focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand',
)

type Props = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  label: string
  name: string
  errors?: string[]
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({
  label,
  name,
  errors,
  options,
  placeholder,
  className,
  ...rest
}: Props) {
  const inputId = `field-${name}`
  const errorId = `${inputId}-error`
  const hasError = !!errors?.length

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold text-foreground"
      >
        {label}
        {rest.required && <span className="text-error"> *</span>}
      </label>
      <select
        id={inputId}
        name={name}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        className={cn(selectBase, hasError && 'border-error', className)}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <FieldError id={errorId} errors={errors} />
    </div>
  )
}
