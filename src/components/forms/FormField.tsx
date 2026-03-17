import { labelStyles, descriptionStyles } from './styles'
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

  const fieldProps = { inputId, hasError, describedBy }

  return (
    <div className="grid self-start">
      <div className="mb-1">
        <label htmlFor={inputId} className={labelStyles}>
          {label}
          {!required && (
            <span className="ml-1.5 text-base font-normal text-muted">
              (optional)
            </span>
          )}
        </label>
        {description && (
          <p id={descId} className={`${descriptionStyles} -mt-1`}>
            {description}
          </p>
        )}
      </div>
      {children(fieldProps)}
      <FieldError id={errorId} errors={errors} />
    </div>
  )
}
