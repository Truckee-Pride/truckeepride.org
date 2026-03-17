'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { FormField } from './FormField'

const Editor = dynamic(
  () =>
    import('./InitializedMDXEditor').then((mod) => ({
      default: mod.InitializedMDXEditor,
    })),
  { ssr: false },
)

type Props = {
  label: string
  name: string
  required?: boolean
  defaultValue?: string
  description?: string
  errors?: string[]
  onChangeAction?: (value: string) => void
}

export function MarkdownEditor({
  label,
  name,
  required,
  defaultValue = '',
  description,
  errors,
  onChangeAction,
}: Props) {
  const [markdown, setMarkdown] = useState(defaultValue)

  const handleChange = useCallback(
    (value: string) => {
      setMarkdown(value)
      onChangeAction?.(value)
    },
    [onChangeAction],
  )

  return (
    <FormField
      label={label}
      name={name}
      required={required}
      description={description}
      errors={errors}
    >
      {({ inputId, hasError, describedBy }) => (
        <div
          id={inputId}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={cn(
            'mdxeditor-form-field rounded-md border border-border',
            'focus-within:border-brand focus-within:ring-1 focus-within:ring-brand',
            hasError && 'border-error',
          )}
        >
          <Editor markdown={defaultValue} onChange={handleChange} />
          <input type="hidden" name={name} value={markdown} />
        </div>
      )}
    </FormField>
  )
}
