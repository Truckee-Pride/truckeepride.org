import { cn } from '@/lib/utils'

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
  ...rest
}: Props) {
  const inputId = `field-${name}`

  return (
    <div>
      <label htmlFor={inputId} className="flex items-center gap-2">
        <input
          type="checkbox"
          id={inputId}
          name={name}
          className={cn(
            'h-4 w-4 rounded border-border accent-brand',
            className,
          )}
          {...rest}
        />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </label>
      {description && (
        <p className="ml-6 mt-0.5 text-sm leading-snug text-muted">
          {description}
        </p>
      )}
    </div>
  )
}
