type Props = {
  id: string
  errors?: string[]
}

export function FieldError({ id, errors }: Props) {
  if (!errors?.length) return null
  return (
    <div id={id} role="alert" className="mt-1 text-sm text-error">
      <p className="m-0 text-sm">{errors[0]}</p>
    </div>
  )
}
