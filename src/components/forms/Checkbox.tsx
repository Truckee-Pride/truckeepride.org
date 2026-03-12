import { cn } from '@/lib/utils'

type Props = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'id' | 'type'
> & {
  label: string
  name: string
}

export function Checkbox({ label, name, className, ...rest }: Props) {
  const inputId = `field-${name}`

  return (
    <label htmlFor={inputId} className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        id={inputId}
        name={name}
        className={cn('h-4 w-4 rounded border-border accent-brand', className)}
        {...rest}
      />
      {label}
    </label>
  )
}
