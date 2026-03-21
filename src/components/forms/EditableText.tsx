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
import { inputBase } from '@/components/forms/Input'
import { validateUrl } from '@/lib/url'
import { cn } from '@/lib/utils'

type SaveResult = { success: boolean; error?: string }

type EditableTextProps = {
  value: string
  onSaveAction: (nextValue: string) => Promise<SaveResult>
  ariaLabel: string
  emptyErrorMessage?: string
  emptyStateText?: string
  placeholder?: string
  className?: string
  textClassName?: string
  suffix?: ReactNode
  /** Input type — when 'url', automatically normalizes (prepends https://) before save. */
  type?: 'text' | 'url' | 'email' | 'tel'
}

const pencilIconStyles =
  'size-4 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'

/** Module-level lock: when an EditableText has a validation error, block other instances from opening. */
let activeErrorInstance: (() => void) | null = null

export function EditableText({
  value,
  onSaveAction,
  ariaLabel,
  emptyErrorMessage = 'Value is required',
  emptyStateText,
  placeholder,
  className,
  textClassName,
  suffix,
  type = 'text',
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
    if (activeErrorInstance) {
      activeErrorInstance()
      return
    }
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
    activeErrorInstance = null
    setIsEditing(false)
  }

  function refocusInput() {
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function setErrorAndLock(message: string) {
    setError(message)
    activeErrorInstance = refocusInput
    refocusInput()
  }

  function handleSave() {
    let trimmedValue = draftValue.trim()
    if (trimmedValue && type === 'url') {
      const { url, error: urlError } = validateUrl(trimmedValue)
      trimmedValue = url
      setDraftValue(trimmedValue)
      if (urlError) {
        setErrorAndLock(urlError)
        return
      }
    }

    if (!trimmedValue && emptyErrorMessage) {
      setErrorAndLock(emptyErrorMessage)
      return
    }

    if (trimmedValue === value) {
      setError(null)
      activeErrorInstance = null
      setIsEditing(false)
      return
    }

    setError(null)
    activeErrorInstance = null
    startTransition(async () => {
      const result = await onSaveAction(trimmedValue)
      if (!result.success) {
        setErrorAndLock(result.error ?? 'Could not save value')
        return
      }

      setIsEditing(false)
    })
  }

  function handleBlur() {
    if (isPending) return

    const trimmedValue = draftValue.trim()

    // No changes — just close
    if (trimmedValue === value || (!trimmedValue && !emptyErrorMessage)) {
      setError(null)
      activeErrorInstance = null
      setIsEditing(false)
      return
    }

    // Empty with required — show error and stay
    if (!trimmedValue && emptyErrorMessage) {
      setErrorAndLock(emptyErrorMessage)
      return
    }

    // Auto-save on blur (handleSave will lock on server error)
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
          type={type}
          value={draftValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={inputBase}
          aria-label={ariaLabel}
          placeholder={placeholder}
          disabled={isPending}
        />
        {error && <p className="text-error mt-0 text-sm">{error}</p>}
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
            'min-w-0 flex-1 overflow-hidden text-left text-ellipsis whitespace-nowrap',
            textClassName,
            !value && emptyStateText && 'text-muted italic',
          )}
        >
          {value || emptyStateText}
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
