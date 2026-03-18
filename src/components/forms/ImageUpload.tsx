'use client'

import {
  useState,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react'
import { upload } from '@vercel/blob/client'
import { TextButton } from '@/components/TextButton'
import { FormField } from './FormField'
import {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  formatFileSize,
} from '@/lib/upload'

export type ImageUploadHandle = {
  needsUpload: boolean
  upload: () => Promise<string | null>
}

type Props = {
  name: string
  label: string
  existingUrl?: string | null
  errors?: string[]
}

type FileState = {
  file: File
  previewUrl: string
  dimensionWarning?: string
}

export const ImageUpload = forwardRef<ImageUploadHandle, Props>(
  function ImageUpload(
    { name, label, existingUrl, errors: externalErrors },
    ref,
  ) {
    const [fileState, setFileState] = useState<FileState | null>(null)
    const [blobUrl, setBlobUrl] = useState<string | null>(null)
    const [showExisting, setShowExisting] = useState(existingUrl != null)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const acceptTypes = ALLOWED_IMAGE_TYPES.join(',')

    const clearFile = useCallback(() => {
      setFileState((prev) => {
        if (prev) URL.revokeObjectURL(prev.previewUrl)
        return null
      })
      setBlobUrl(null)
      setError(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }, [])

    function validateFile(file: File): string | null {
      if (
        !ALLOWED_IMAGE_TYPES.includes(
          file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
        )
      ) {
        return `Invalid file type. Allowed: JPEG, PNG, WebP, GIF`
      }
      if (file.size > MAX_FILE_SIZE) {
        return `File too large (${formatFileSize(file.size)}). Maximum is ${formatFileSize(MAX_FILE_SIZE)}.`
      }
      return null
    }

    function checkDimensions(file: File): Promise<string | undefined> {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          URL.revokeObjectURL(img.src)
          if (img.width > 4000 || img.height > 6000) {
            resolve('This image is very large and may be slow to upload')
          } else {
            resolve(undefined)
          }
        }
        img.onerror = () => {
          URL.revokeObjectURL(img.src)
          resolve(undefined)
        }
        img.src = URL.createObjectURL(file)
      })
    }

    async function handleFile(file: File) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setError(null)
      setShowExisting(false)
      setBlobUrl(null)

      const dimensionWarning = await checkDimensions(file)
      const previewUrl = URL.createObjectURL(file)

      setFileState((prev) => {
        if (prev) URL.revokeObjectURL(prev.previewUrl)
        return { file, previewUrl, dimensionWarning }
      })
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    }

    function handleDrop(e: React.DragEvent) {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    }

    function handleDragOver(e: React.DragEvent) {
      e.preventDefault()
      setIsDragOver(true)
    }

    function handleDragLeave(e: React.DragEvent) {
      e.preventDefault()
      setIsDragOver(false)
    }

    useImperativeHandle(ref, () => ({
      needsUpload: fileState != null && !blobUrl,
      upload: async () => {
        // Nothing selected — use existing or empty
        if (!fileState) return showExisting && existingUrl ? existingUrl : null

        // Already uploaded (e.g. retry after form error)
        if (blobUrl) return blobUrl

        setUploading(true)
        setUploadProgress(0)
        try {
          const blob = await upload(fileState.file.name, fileState.file, {
            access: 'public',
            handleUploadUrl: '/api/upload',
            onUploadProgress: ({ percentage }) => {
              setUploadProgress(percentage)
            },
          })
          setBlobUrl(blob.url)
          return blob.url
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Upload failed'
          setError(message)
          throw new Error(message)
        } finally {
          setUploading(false)
        }
      },
    }))

    // Hidden input value: blob URL > existing URL > empty
    const hiddenValue =
      blobUrl ?? (showExisting && existingUrl ? existingUrl : '')

    const allErrors = [...(externalErrors ?? []), ...(error ? [error] : [])]

    return (
      <FormField
        label={label}
        name={name}
        errors={allErrors.length ? allErrors : undefined}
      >
        {({ inputId, hasError, describedBy }) => (
          <div>
            <input type="hidden" name={name} value={hiddenValue} />
            <input
              ref={fileInputRef}
              id={inputId}
              type="file"
              accept={acceptTypes}
              onChange={handleInputChange}
              className="sr-only"
              aria-invalid={hasError || undefined}
              aria-describedby={describedBy}
            />

            {/* Existing image preview */}
            {showExisting && existingUrl && !fileState && (
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={existingUrl}
                  alt="Current flyer"
                  className="h-32 w-32 rounded-md border border-border object-cover"
                />
                <div className="flex gap-2 pt-1">
                  <TextButton
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm"
                  >
                    Replace
                  </TextButton>
                  <TextButton
                    type="button"
                    intent="danger"
                    onClick={() => {
                      setShowExisting(false)
                      clearFile()
                    }}
                    className="text-sm"
                  >
                    Remove
                  </TextButton>
                </div>
              </div>
            )}

            {/* New file preview */}
            {fileState && !uploading && (
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fileState.previewUrl}
                  alt="Preview"
                  className="h-32 w-32 rounded-md border border-border object-cover"
                />
                <div className="space-y-1 pt-1">
                  <p className="text-sm font-medium text-foreground">
                    {fileState.file.name}
                  </p>
                  <p className="text-sm text-muted">
                    {formatFileSize(fileState.file.size)}
                  </p>
                  {fileState.dimensionWarning && (
                    <p className="text-sm text-warning">
                      {fileState.dimensionWarning}
                    </p>
                  )}
                  <TextButton
                    type="button"
                    intent="danger"
                    onClick={clearFile}
                    className="text-sm"
                  >
                    Remove
                  </TextButton>
                </div>
              </div>
            )}

            {/* Upload progress bar */}
            {uploading && (
              <div className="space-y-2">
                <p className="text-sm text-muted">Uploading...</p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-brand transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Drop zone */}
            {!showExisting && !fileState && !uploading && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex cursor-pointer flex-col items-center rounded-md border-2 border-dashed px-6 py-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-brand bg-brand/5'
                    : hasError
                      ? 'border-error'
                      : 'border-border hover:border-brand/50'
                }`}
              >
                <p className="text-sm font-medium text-foreground">
                  Drag and drop an image, or click to browse
                </p>
                <p className="mt-1 text-sm text-muted">
                  JPEG, PNG, WebP, or GIF up to {formatFileSize(MAX_FILE_SIZE)}
                </p>
              </div>
            )}
          </div>
        )}
      </FormField>
    )
  },
)
