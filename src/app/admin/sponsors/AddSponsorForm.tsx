'use client'

import { useActionState, useRef, useCallback, useState } from 'react'
import {
  ImageUpload,
  type ImageUploadHandle,
} from '@/components/forms/ImageUpload'
import { Input } from '@/components/forms/Input'
import { FormError } from '@/components/forms/FormError'
import { Button } from '@/components/Button'
import { Form } from '@/components/forms/Form'
import { addSponsor } from './actions'

type ActionState = { success: boolean; error?: string }

const initialState: ActionState = { success: false }

export function AddSponsorForm() {
  const imageUploadRef = useRef<ImageUploadHandle>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Wrap the server action to handle client-side image upload first
  const wrappedAction = useCallback(
    async (_prev: ActionState, formData: FormData) => {
      setUploadError(null)

      if (imageUploadRef.current?.needsUpload) {
        setIsUploading(true)
        try {
          const url = await imageUploadRef.current.upload()
          if (url) {
            formData.set('imageUrl', url)
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Upload failed'
          setUploadError(message)
          return { success: false, error: message }
        } finally {
          setIsUploading(false)
        }
      }

      return addSponsor(formData)
    },
    [],
  )

  const [state, formAction, isPending] = useActionState(
    wrappedAction,
    initialState,
  )

  const isWorking = isPending || isUploading

  return (
    <Form action={formAction} className="space-y-4">
      <ImageUpload
        ref={imageUploadRef}
        name="imageUrl"
        label="Sponsor logo"
        errors={uploadError ? [uploadError] : undefined}
      />
      <Input
        label="Sponsor name"
        name="name"
        placeholder="e.g. Truckee Cultural District"
        required
      />
      <FormError message={state.error} />
      <Button type="submit" disabled={isWorking}>
        {isWorking ? 'Adding…' : 'Add Sponsor'}
      </Button>
    </Form>
  )
}
