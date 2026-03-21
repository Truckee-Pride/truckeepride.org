type Props = {
  message?: string
}

export function FormError({ message }: Props) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="border-error-border bg-error-bg text-error rounded-md border px-4 py-3 text-sm"
    >
      {message}
    </div>
  )
}
