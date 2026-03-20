'use client'

import { useActionState, useRef, useCallback, useState, useEffect } from 'react'
import {
  ImageUpload,
  type ImageUploadHandle,
} from '@/components/forms/ImageUpload'
import { Input } from '@/components/forms/Input'
import { Button } from '@/components/Button'
import { Form } from '@/components/forms/Form'
import { addSponsor } from './actions'

type ActionState = {
  success: boolean
  fieldErrors?: { image?: string[]; name?: string[] }
}

const initialState: ActionState = { success: false }

export function AddSponsorForm() {
  const imageUploadRef = useRef<ImageUploadHandle>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [name, setName] = useState('')

  const wrappedAction = useCallback(
    async (_prev: ActionState, formData: FormData): Promise<ActionState> => {
      const nameValue = formData.get('name')?.toString().trim() ?? ''
      const imageValue = formData.get('imageUrl')?.toString().trim() ?? ''
      if (!nameValue || !imageValue) {
        return {
          success: false,
          fieldErrors: {
            ...(!imageValue && { image: ['Image is required'] }),
            ...(!nameValue && { name: ['Sponsor name is required'] }),
          },
        }
      }

      if (imageUploadRef.current?.needsUpload) {
        setIsUploading(true)
        try {
          const url = await imageUploadRef.current.upload()
          if (url) formData.set('imageUrl', url)
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Upload failed'
          return { success: false, fieldErrors: { image: [message] } }
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

  useEffect(() => {
    if (state.success) {
      imageUploadRef.current?.clear()
      setName('')
    }
  }, [state])

  return (
    <Form action={formAction} className="space-y-4">
      <ImageUpload
        ref={imageUploadRef}
        name="imageUrl"
        label="Sponsor logo"
        errors={state.fieldErrors?.image}
      />
      <Input
        label="Sponsor name"
        name="name"
        placeholder="e.g. Truckee Cultural District"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        errors={state.fieldErrors?.name}
      />
      <Button type="submit" disabled={isWorking}>
        {isWorking ? 'Adding…' : 'Add Sponsor'}
      </Button>
    </Form>
  )
}
