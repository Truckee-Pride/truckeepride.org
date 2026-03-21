type Props = {
  id: string
  errors?: string[]
}

export function FieldError({ id, errors }: Props) {
  if (!errors?.length) return null
  return (
    <div id={id} role="alert" className="text-error mt-1 text-sm">
      <p className="m-0 text-sm">{errors[0]}</p>
    </div>
  )
}
