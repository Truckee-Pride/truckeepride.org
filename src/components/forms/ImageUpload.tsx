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
  uploading: boolean
  upload: () => Promise<string | null>
  clear: () => void
}

type Props = {
  name: string
  label: string
  existingUrl?: string | null
  errors?: string[]
  onUploadingChangeAction?: (uploading: boolean) => void
}

type FileState = {
  file: File
  previewUrl: string
  dimensionWarning?: string
}

export const ImageUpload = forwardRef<ImageUploadHandle, Props>(
  function ImageUpload(
    { name, label, existingUrl, errors: externalErrors, onUploadingChangeAction },
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

      // Start upload immediately
      setUploading(true)
      setUploadProgress(0)
      onUploadingChangeAction?.(true)
      try {
        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          onUploadProgress: ({ percentage }) => {
            setUploadProgress(percentage)
          },
        })
        setBlobUrl(blob.url)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setError(message)
      } finally {
        setUploading(false)
        onUploadingChangeAction?.(false)
      }
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
      needsUpload: false,
      uploading,
      clear: () => {
        setFileState(null)
        setBlobUrl(null)
        setShowExisting(false)
        setError(null)
      },
      upload: async () => {
        // Upload happens instantly on selection now — just return the result
        if (!fileState) return showExisting && existingUrl ? existingUrl : null
        if (blobUrl) return blobUrl
        return null
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

            {/* New file preview (with upload overlay when uploading) */}
            {fileState && (
              <div className="flex items-start gap-4">
                <div className="relative h-32 w-32 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fileState.previewUrl}
                    alt="Preview"
                    className="h-32 w-32 rounded-md border border-border object-cover"
                  />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-md bg-white/60">
                      <svg
                        className="h-12 w-12 -rotate-90"
                        viewBox="0 0 48 48"
                        aria-label={`Uploading: ${Math.round(uploadProgress)}%`}
                        role="progressbar"
                        aria-valuenow={Math.round(uploadProgress)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        {/* Track */}
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="rgba(255,255,255,0.8)"
                          strokeWidth="4"
                        />
                        {/* Progress */}
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="none"
                          stroke="white"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 20}
                          strokeDashoffset={
                            2 * Math.PI * 20 * (1 - uploadProgress / 100)
                          }
                          className="drop-shadow-md transition-[stroke-dashoffset] duration-200"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="space-y-1 pt-1">
                  <p className="text-sm font-medium text-foreground">
                    {fileState.file.name}
                  </p>
                  <p className="text-sm text-muted">
                    {formatFileSize(fileState.file.size)}
                    {uploading && ' — Uploading…'}
                  </p>
                  {fileState.dimensionWarning && (
                    <p className="text-sm text-warning">
                      {fileState.dimensionWarning}
                    </p>
                  )}
                  {!uploading && (
                    <TextButton
                      type="button"
                      intent="danger"
                      onClick={clearFile}
                      className="text-sm"
                    >
                      Remove
                    </TextButton>
                  )}
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
