import { useState } from 'react'
import type { ZodTypeAny } from 'zod'

type FieldErrors = Partial<Record<string, string[]>>

export function useFormErrors(
  shape: Record<string, ZodTypeAny>,
  externalErrors?: FieldErrors,
) {
  const [localErrors, setLocalErrors] = useState<FieldErrors>({})
  const [prevExternal, setPrevExternal] = useState(externalErrors)

  // When a new server response arrives, reset local overrides
  if (externalErrors !== prevExternal) {
    setPrevExternal(externalErrors)
    setLocalErrors({})
  }

  // Local entries override external (empty array clears an external error)
  const errors: FieldErrors = { ...externalErrors, ...localErrors }

  function onFieldChange(name: string, value: unknown) {
    if (!errors[name]?.length) return // no error → nothing to do
    const fieldSchema = shape[name]
    if (!fieldSchema) return
    if (fieldSchema.safeParse(value).success) {
      setLocalErrors((prev) => ({ ...prev, [name]: [] }))
    }
  }

  return { errors, onFieldChange, setLocalErrors }
}
