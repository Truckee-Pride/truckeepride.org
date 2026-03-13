import { cn } from '@/lib/utils'
import { FormField } from './FormField'

const selectBase = cn(
  'h-10 w-full rounded-md border border-border bg-background px-3 py-2',
  'text-base text-foreground',
  'focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand',
)

type Props = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  label: string
  name: string
  errors?: string[]
  description?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({
  label,
  name,
  errors,
  description,
  options,
  placeholder,
  className,
  ...rest
}: Props) {
  return (
    <FormField
      label={label}
      name={name}
      required={rest.required}
      description={description}
      errors={errors}
    >
      {({ inputId, hasError, describedBy }) => (
        <select
          id={inputId}
          name={name}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
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
      )}
    </FormField>
  )
}
