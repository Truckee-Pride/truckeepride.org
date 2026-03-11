'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

export function FlyerImage({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="block max-w-sm max-[384px]:-mx-4 cursor-zoom-in"
        aria-label="View full flyer"
      >
        <Image
          src={src}
          alt={alt}
          width={800}
          height={1100}
          style={{ width: '100%', height: 'auto' }}
          className="block"
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Flyer lightbox"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full"
          >
            <Image
              src={src}
              alt={alt}
              width={800}
              height={1100}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: 'calc(100dvh - 2rem)',
              }}
              className="rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}
