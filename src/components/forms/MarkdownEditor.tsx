'use client'

import { useState, useCallback, useRef } from 'react'
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

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function findSibling(
  from: HTMLElement,
  direction: 'forward' | 'backward',
): HTMLElement | null {
  const form = from.closest('form')
  if (!form) return null
  const all = Array.from(form.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !from.contains(el),
  )
  // Find the element closest to `from` in DOM order
  const idx = all.findIndex(
    (el) => from.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING,
  )
  if (direction === 'forward') return all[idx] ?? null
  return all[idx - 1] ?? null
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
  const wrapperRef = useRef<HTMLDivElement>(null)

  function handleFocus(e: React.FocusEvent<HTMLDivElement>) {
    // If focus landed on the wrapper itself (via tab), forward it to the
    // contenteditable area so the user can start typing immediately.
    if (e.target === wrapperRef.current) {
      const editable = wrapperRef.current.querySelector<HTMLElement>(
        '[contenteditable="true"]',
      )
      editable?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // Let Tab move focus to the next/previous field instead of inserting a tab
    if (e.key === 'Tab') {
      e.preventDefault()
      // Temporarily remove tabIndex so the wrapper is skipped when moving focus
      wrapperRef.current?.setAttribute('tabindex', '-1')
      if (e.shiftKey) {
        // Move focus backward to the previous focusable element
        const prev = findSibling(wrapperRef.current!, 'backward')
        prev?.focus()
      } else {
        const next = findSibling(wrapperRef.current!, 'forward')
        next?.focus()
      }
      wrapperRef.current?.setAttribute('tabindex', '0')
    }
  }

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
          ref={wrapperRef}
          id={inputId}
          tabIndex={0} // This is necessary to make the editor tabbable
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
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
