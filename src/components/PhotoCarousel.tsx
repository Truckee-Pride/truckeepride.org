'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type CarouselPhoto = {
  id: string
  src: string
  alt: string
}

type Props = {
  photos: CarouselPhoto[]
}

const container = cn(
  'relative h-[300px] sm:h-[400px] overflow-hidden rounded-xl',
)

const arrowBase = cn(
  'absolute top-1/2 z-10 -translate-y-1/2',
  'flex h-10 w-10 items-center justify-center',
  'rounded-full bg-black/50 text-white',
  'transition-colors hover:bg-black/70',
)

const dotContainer = cn(
  'absolute bottom-3 left-1/2 z-10',
  'flex -translate-x-1/2 gap-2',
)

const dotBase = 'h-2.5 w-2.5 rounded-full transition-colors'

export function PhotoCarousel({ photos }: Props) {
  const [current, setCurrent] = useState(0)

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % photos.length) + photos.length) % photos.length)
    },
    [photos.length],
  )

  const goNext = useCallback(() => goTo(current + 1), [current, goTo])
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    if (photos.length <= 1) return
    const timer = setInterval(goNext, 5000)
    return () => clearInterval(timer)
  }, [goNext, photos.length])

  if (photos.length === 0) return null

  return (
    <div className={container}>
      <Image
        src={photos[current].src}
        alt={photos[current].alt}
        fill
        sizes="(max-width: 640px) 100vw, 672px"
        className="object-cover"
        priority={current === 0}
      />

      {photos.length > 1 && (
        <>
          <button
            aria-label="Previous photo"
            onClick={goPrev}
            className={cn(arrowBase, 'left-3')}
          >
            <ChevronLeft />
          </button>
          <button
            aria-label="Next photo"
            onClick={goNext}
            className={cn(arrowBase, 'right-3')}
          >
            <ChevronRight />
          </button>

          <div className={dotContainer}>
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                aria-label={`Go to photo ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn(
                  dotBase,
                  i === current ? 'bg-white' : 'bg-white/50',
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ChevronLeft() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
