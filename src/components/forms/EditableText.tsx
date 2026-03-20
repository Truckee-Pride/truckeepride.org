'use client'

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { Pencil } from 'lucide-react'
import { TextButton } from '@/components/TextButton'
import { cn } from '@/lib/utils'

type SaveResult = { success: boolean; error?: string }

type EditableTextProps = {
  value: string
  onSaveAction: (nextValue: string) => Promise<SaveResult>
  ariaLabel: string
  emptyErrorMessage?: string
  className?: string
  textClassName?: string
  suffix?: ReactNode
}

const pencilIconStyles =
  'size-4 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'

export function EditableText({
  value,
  onSaveAction,
  ariaLabel,
  emptyErrorMessage = 'Value is required',
  className,
  textClassName,
  suffix,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftValue, setDraftValue] = useState(value)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isEditing) setDraftValue(value)
  }, [value, isEditing])

  function handleEditName() {
    setDraftValue(value)
    setError(null)
    setIsEditing(true)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setDraftValue(event.target.value)
  }

  function handleCancelEdit() {
    setDraftValue(value)
    setError(null)
    setIsEditing(false)
  }

  function handleSave() {
    const trimmedValue = draftValue.trim()

    if (!trimmedValue) {
      setError(emptyErrorMessage)
      return
    }

    if (trimmedValue === value) {
      setError(null)
      setIsEditing(false)
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await onSaveAction(trimmedValue)
      if (!result.success) {
        setError(result.error ?? 'Could not save value')
        return
      }

      setIsEditing(false)
    })
  }

  function handleBlur() {
    if (isPending) return

    const trimmedValue = draftValue.trim()
    if (!trimmedValue || trimmedValue === value) {
      if (trimmedValue === value) setIsEditing(false)
      return
    }

    const shouldSave = window.confirm(`Save updated value: "${trimmedValue}"?`)
    if (!shouldSave) {
      handleCancelEdit()
      return
    }

    handleSave()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSave()
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      handleCancelEdit()
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-1">
        <input
          ref={inputRef}
          value={draftValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="h-9 w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          aria-label={ariaLabel}
          disabled={isPending}
        />
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    )
  }

  return (
    <div className={cn('group flex items-center gap-2', className)}>
      <TextButton
        type="button"
        intent="defaultText"
        onClick={handleEditName}
        className="flex min-w-0 items-center gap-1"
        aria-label={ariaLabel}
      >
        <span
          className={cn(
            'min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left',
            textClassName,
          )}
        >
          {value}
        </span>
        {suffix ? (
          <span className="min-w-0 shrink overflow-hidden text-ellipsis whitespace-nowrap">
            {suffix}
          </span>
        ) : null}
        <Pencil className={cn(pencilIconStyles, 'shrink-0')} />
      </TextButton>
    </div>
  )
}
