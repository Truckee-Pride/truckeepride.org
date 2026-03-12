import { z } from 'zod'

export const AGE_RESTRICTION_OPTIONS = [
  'All ages',
  '18+',
  '21+',
  'Some parts 21+',
  'PG-13',
] as const
export type AgeRestriction = (typeof AGE_RESTRICTION_OPTIONS)[number]

export const createEventSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().min(1, 'Description is required'),
    locationName: z.string().min(1, 'Location name is required').max(200),
    locationAddress: z.string().max(400).optional(),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().optional(),
    flyerUrl: z
      .string()
      .url('Must be a valid URL')
      .optional()
      .or(z.literal('')),
    ticketUrl: z
      .string()
      .url('Must be a valid URL')
      .optional()
      .or(z.literal('')),
    shortDescription: z.string().max(500).optional(),
    emoji: z.string().max(10).optional(),
    requiresTicket: z.boolean().optional().default(false),
    ageRestriction: z.enum(AGE_RESTRICTION_OPTIONS).optional(),
    dogsWelcome: z.boolean().optional().default(false),
  })
  .refine((data) => !data.endTime || data.endTime >= data.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  })
  .refine((data) => !data.ticketUrl || data.requiresTicket, {
    message: 'Ticket URL requires "Requires Ticket" to be enabled',
    path: ['ticketUrl'],
  })

export const updateEventSchema = createEventSchema

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
