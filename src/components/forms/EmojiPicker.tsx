'use client'

import { useState, useRef, useEffect } from 'react'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { FormField } from './FormField'

type Props = {
  name: string
  label: string
  defaultValue?: string
}

export function EmojiPicker({ name, label, defaultValue = '' }: Props) {
  const [emoji, setEmoji] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close picker on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  return (
    <div ref={containerRef}>
      <FormField label={label} name={name}>
        {() => (
          <>
            <input type="hidden" name={name} value={emoji} />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-xl transition-colors hover:bg-surface"
              >
                {emoji || '🏳️‍🌈'}
              </button>
              {emoji && (
                <button
                  type="button"
                  onClick={() => setEmoji('')}
                  className="text-sm text-muted hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </>
        )}
      </FormField>
      {open && (
        <div className="absolute z-10 mt-1">
          <Picker
            data={data}
            onEmojiSelect={(emojiData: { native: string }) => {
              setEmoji(emojiData.native)
              setOpen(false)
            }}
            theme="light"
            previewPosition="none"
            skinTonePosition="search"
          />
        </div>
      )}
    </div>
  )
}
