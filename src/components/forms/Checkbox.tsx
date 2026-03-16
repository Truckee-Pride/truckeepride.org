import { cn } from '@/lib/utils'
import { labelStyles, descriptionStyles } from './styles'

type Props = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'id' | 'type'
> & {
  label: string
  name: string
  description?: string
}

export function Checkbox({
  label,
  name,
  description,
  className,
  value,
  ...rest
}: Props) {
  const inputId = value ? `field-${name}-${value}` : `field-${name}`
  const descId = description ? `${inputId}-desc` : undefined

  return (
    <div>
      <label
        htmlFor={inputId}
        className={`${labelStyles} flex items-center gap-2 leading-none`}
      >
        <input
          type="checkbox"
          id={inputId}
          name={name}
          value={value}
          aria-describedby={descId}
          className={cn(
            'h-4 w-4 rounded border-border accent-brand',
            className,
          )}
          {...rest}
        />
        {label}
      </label>
      {description && (
        <p id={descId} className={`${descriptionStyles} ml-6 mt-0`}>
          {description}
        </p>
      )}
    </div>
  )
}
