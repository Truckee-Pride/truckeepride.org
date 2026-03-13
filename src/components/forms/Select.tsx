import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormField } from './FormField'

const selectBase = cn(
  'h-10 w-full appearance-none rounded-md border border-border bg-background bg-none px-3 py-2 pr-8',
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
        <div className={cn('relative', className)}>
          <select
            id={inputId}
            name={name}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            className={cn(selectBase, hasError && 'border-error')}
            {...rest}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-subtle"
          />
        </div>
      )}
    </FormField>
  )
}
