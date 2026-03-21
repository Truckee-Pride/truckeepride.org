'use client'

import { useState } from 'react'
import { Input } from './Input'
import { validateUrl } from '@/lib/url'

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> & {
  label: string
  name: string
  errors?: string[]
  description?: string
}

export function UrlInput({ value: controlledValue, onChange, onBlur, errors, ...rest }: Props) {
  const [internalValue, setInternalValue] = useState(
    (controlledValue as string) ?? '',
  )
  const [domainError, setDomainError] = useState<string | null>(null)

  const isControlled = controlledValue !== undefined
  const displayValue = isControlled ? controlledValue : internalValue

  const allErrors = domainError
    ? [...(errors ?? []), domainError]
    : errors

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (domainError) setDomainError(null)
    if (!isControlled) setInternalValue(e.target.value)
    onChange?.(e)
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw) {
      const { url: normalized, error } = validateUrl(raw)
      setDomainError(error)
      if (normalized !== raw) {
        if (!isControlled) setInternalValue(normalized)
        e.target.value = normalized
        onChange?.(e as React.ChangeEvent<HTMLInputElement>)
      }
    } else {
      setDomainError(null)
    }
    onBlur?.(e)
  }

  return (
    <Input
      type="url"
      placeholder="https://www.example.com/"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      errors={allErrors}
      {...rest}
    />
  )
}
