type Props = {
  id: string
  errors?: string[]
}

export function FieldError({ id, errors }: Props) {
  if (!errors?.length) return null
  return (
    <div id={id} role="alert" className="mt-1 text-sm text-error">
      {errors.map((err) => (
        <p key={err} className="m-0 text-sm">
          {err}
        </p>
      ))}
    </div>
  )
}
