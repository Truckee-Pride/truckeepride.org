import { z } from 'zod'

export const createEventSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().min(1, 'Description is required'),
    locationName: z.string().min(1, 'Location name is required').max(200),
    locationAddress: z.string().max(400).optional(),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().optional(),
    imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    externalUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  })
  .refine(
    (data) => !data.endTime || data.endTime >= data.startTime,
    { message: 'End time must be after start time', path: ['endTime'] }
  )

export const updateEventSchema = createEventSchema

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
