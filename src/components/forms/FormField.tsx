import { FieldError } from './FieldError'

export type FieldProps = {
  inputId: string
  hasError: boolean
  describedBy: string | undefined
}

type Props = {
  label: string
  name: string
  required?: boolean
  description?: string
  errors?: string[]
  children: (fieldProps: FieldProps) => React.ReactNode
}

export function FormField({
  label,
  name,
  required,
  description,
  errors,
  children,
}: Props) {
  const inputId = `field-${name}`
  const errorId = `${inputId}-error`
  const descId = description ? `${inputId}-desc` : undefined
  const hasError = !!errors?.length

  const describedBy =
    [hasError && errorId, descId].filter(Boolean).join(' ') || undefined

  return (
    <div className="grid">
      <div className="mb-1">
        <label
          htmlFor={inputId}
          className="text-lg font-medium text-foreground"
        >
          {label}
          {!required && (
            <span className="ml-1.5 text-base font-normal text-muted">
              (optional)
            </span>
          )}
        </label>
        {description && (
          <p id={descId} className="-mt-1 text-base leading-snug text-muted">
            {description}
          </p>
        )}
      </div>
      {children({ inputId, hasError, describedBy })}
      <FieldError id={errorId} errors={errors} />
    </div>
  )
}
