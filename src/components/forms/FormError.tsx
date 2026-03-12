type Props = {
  message?: string
}

export function FormError({ message }: Props) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="rounded-lg border border-error-border bg-error-bg px-4 py-3 text-sm text-error"
    >
      {message}
    </div>
  )
}
