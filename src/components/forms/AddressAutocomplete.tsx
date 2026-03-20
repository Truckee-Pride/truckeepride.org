'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { FormField } from './FormField'
import {
  usePlacesAutocomplete,
  type PlacePrediction,
} from '@/hooks/usePlacesAutocomplete'

const inputBase = cn(
  'h-10 w-full rounded-md border border-border bg-background px-3 py-2',
  'text-base text-foreground placeholder:text-subtle',
  'focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand',
)

const dropdownStyles = cn(
  'absolute left-0 right-0 top-full z-50 mt-1',
  'overflow-hidden rounded-md border border-border bg-background shadow-lg',
)

const optionStyles = cn('cursor-pointer px-3 py-2 text-sm', 'hover:bg-muted/50')

const optionActiveStyles = 'bg-muted/50'

type Props = {
  label: string
  name: string
  errors?: string[]
  description?: string
  value?: string
  defaultGoogleMapsUrl?: string
  maxLength?: number
  placeholder?: string
  onChangeAction?: (value: string) => void
  onPlaceSelectedAction?: (placeName: string) => void
  onGoogleMapsUrlChangeAction?: (url: string) => void
}

export function AddressAutocomplete({
  label,
  name,
  errors,
  description,
  value: controlledValue,
  defaultGoogleMapsUrl,
  maxLength,
  placeholder,
  onChangeAction,
  onPlaceSelectedAction,
  onGoogleMapsUrlChangeAction,
}: Props) {
  const { input, setInput, predictions, isLoading, error } =
    usePlacesAutocomplete()
  const [googleMapsUrl, setGoogleMapsUrl] = useState(defaultGoogleMapsUrl ?? '')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Sync controlled value into autocomplete input
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInput(controlledValue)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- only sync on mount

  // Show dropdown when predictions arrive
  useEffect(() => {
    if (predictions.length > 0) {
      setIsOpen(true)
      setActiveIndex(-1)
    } else {
      setIsOpen(false)
    }
  }, [predictions])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setInput(val)
    onChangeAction?.(val)
    // Clear stale geo data when user types manually
    if (googleMapsUrl) {
      setGoogleMapsUrl('')
      onGoogleMapsUrlChangeAction?.('')
    }
  }

  function handleSelect(prediction: PlacePrediction) {
    const address = prediction.description
    setInput(address)
    onChangeAction?.(address)

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}&query_place_id=${prediction.placeId}`
    setGoogleMapsUrl(url)
    onGoogleMapsUrlChangeAction?.(url)

    if (prediction.mainText) {
      onPlaceSelectedAction?.(prediction.mainText)
    }

    setIsOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || predictions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev < predictions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : predictions.length - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(predictions[activeIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  return (
    <FormField
      label={label}
      name={name}
      description={description}
      errors={errors}
    >
      {({ inputId, hasError, describedBy }) => (
        <div ref={wrapperRef} className="relative">
          <input
            id={inputId}
            name={name}
            value={controlledValue ?? input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls={isOpen ? `${inputId}-listbox` : undefined}
            aria-activedescendant={
              activeIndex >= 0 ? `${inputId}-option-${activeIndex}` : undefined
            }
            role="combobox"
            autoComplete="off"
            data-1p-ignore
            data-bwignore
            data-lpignore="true"
            data-form-type="other"
            maxLength={maxLength}
            placeholder={placeholder}
            className={cn(inputBase, hasError && 'border-error')}
          />
          <input type="hidden" name="googleMapsUrl" value={googleMapsUrl} />

          {isOpen && predictions.length > 0 && (
            <ul
              id={`${inputId}-listbox`}
              ref={listRef}
              role="listbox"
              className={dropdownStyles}
            >
              {predictions.map((p, i) => (
                <li
                  key={p.placeId}
                  id={`${inputId}-option-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  className={cn(
                    optionStyles,
                    i === activeIndex && optionActiveStyles,
                  )}
                  onMouseDown={() => handleSelect(p)}
                >
                  <span className="font-medium">{p.mainText}</span>
                  {p.secondaryText && (
                    <span className="text-muted"> — {p.secondaryText}</span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-brand" />
            </div>
          )}

          {error && <p className="mt-1 text-sm text-error">{error}</p>}
        </div>
      )}
    </FormField>
  )
}
