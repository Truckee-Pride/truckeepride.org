import { cn } from '@/lib/utils'
import { FormField } from './FormField'

const textareaBase = cn(
  'w-full rounded-md border border-border bg-background px-3 py-2',
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
  return (
    <FormField
      label={label}
      name={name}
      required={rest.required}
      description={description}
      errors={errors}
    >
      {({ inputId, hasError, describedBy }) => (
        <textarea
          id={inputId}
          name={name}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={cn(textareaBase, hasError && 'border-error', className)}
          {...rest}
        />
      )}
    </FormField>
  )
}
