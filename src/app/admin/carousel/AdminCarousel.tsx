'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/Button'
import { Input } from '@/components/forms/Input'
import {
  ImageUpload,
  type ImageUploadHandle,
} from '@/components/forms/ImageUpload'
import {
  addCarouselPhoto,
  reorderCarouselPhotos,
  deleteCarouselPhoto,
} from './actions'
import type { carouselPhotos } from '@/db/schema'

type Photo = typeof carouselPhotos.$inferSelect

type Props = {
  initialPhotos: Photo[]
}

const thumbnail = cn(
  'relative rounded-md border border-border',
  'transition-shadow hover:shadow-md',
)

const thumbnailDragging = 'opacity-50'
const thumbnailDropTarget = 'ring-2 ring-brand'

const badge = cn(
  'absolute top-1 left-1 rounded bg-black/60',
  'px-1.5 py-0.5 text-xs text-white',
)

const deleteBtn = cn(
  'absolute top-1 right-1 flex h-6 w-6 items-center justify-center',
  'rounded-full bg-black/60 text-white',
  'transition-colors hover:bg-red-600',
)

const photoGrid = cn('grid grid-cols-2 gap-4', 'sm:grid-cols-3 md:grid-cols-4')

export function AdminCarousel({ initialPhotos }: Props) {
  const router = useRouter()
  const imageUploadRef = useRef<ImageUploadHandle>(null)
  const [photos, setPhotos] = useState(initialPhotos)
  const [altText, setAltText] = useState('')
  const [adding, setAdding] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  async function handleAdd() {
    if (!imageUploadRef.current?.needsUpload) return
    if (!altText.trim()) return

    setAdding(true)
    try {
      const url = await imageUploadRef.current.upload()
      if (!url) return

      const result = await addCarouselPhoto(url, altText.trim())
      if (result.success) {
        setAltText('')
        router.refresh()
      }
    } finally {
      setAdding(false)
    }
  }

  function handleDragStart(index: number) {
    return () => setDragIndex(index)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function handleDragEnter(index: number) {
    return () => setDropIndex(index)
  }

  function handleDrop(targetIndex: number) {
    return async () => {
      if (dragIndex === null || dragIndex === targetIndex) {
        setDragIndex(null)
        setDropIndex(null)
        return
      }

      const reordered = [...photos]
      const [moved] = reordered.splice(dragIndex, 1)
      reordered.splice(targetIndex, 0, moved)
      setPhotos(reordered)
      setDragIndex(null)
      setDropIndex(null)

      await reorderCarouselPhotos(reordered.map((p) => p.id))
    }
  }

  function handleDragEnd() {
    setDragIndex(null)
    setDropIndex(null)
  }

  function handleDelete(id: string, alt: string) {
    return async () => {
      if (!window.confirm(`Delete "${alt}"?`)) return
      setPhotos((prev) => prev.filter((p) => p.id !== id))
      await deleteCarouselPhoto(id)
    }
  }

  function handleAltChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAltText(e.target.value)
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2>Add New Photo</h2>
        <ImageUpload
          ref={imageUploadRef}
          name="photo"
          label="Upload a carousel photo"
        />
        <Input
          name="alt"
          label="Alt text (describe the photo)"
          value={altText}
          onChange={handleAltChange}
          required
        />
        <Button type="button" onClick={handleAdd} disabled={adding}>
          {adding ? 'Adding...' : 'Add Photo'}
        </Button>
      </section>

      <section className="space-y-4">
        <h2>Current Photos</h2>
        <p className="text-muted">
          Drag and drop to reorder. The order here matches what visitors see.
        </p>
        {photos.length === 0 ? (
          <p className="text-muted">No carousel photos yet.</p>
        ) : (
          <div className={photoGrid}>
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                draggable
                onDragStart={handleDragStart(index)}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter(index)}
                onDrop={handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  thumbnail,
                  'cursor-grab active:cursor-grabbing',
                  dragIndex === index && thumbnailDragging,
                  dropIndex === index &&
                    dragIndex !== index &&
                    thumbnailDropTarget,
                )}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={144}
                  height={96}
                  className="h-24 w-full rounded-md object-cover"
                />
                <span className={badge}>{index + 1}</span>
                <button
                  aria-label={`Delete ${photo.alt}`}
                  onClick={handleDelete(photo.id, photo.alt)}
                  className={deleteBtn}
                >
                  <XIcon />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
