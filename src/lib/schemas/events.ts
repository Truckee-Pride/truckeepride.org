import { z } from 'zod'
import {
  SAFE_LINK_PROTOCOLS,
  HTTPS_PROTOCOL,
  HAS_DOMAIN,
} from '@/lib/constants'

export const VIBE_TAGS = [
  'Sporty',
  'Crafty',
  'Family Focused',
  'Smarty Pants',
  "Let's Dance",
  'Wellness',
] as const
export type VibeTag = (typeof VIBE_TAGS)[number]

export const AGE_RESTRICTION_OPTIONS = [
  'All ages',
  '18+',
  '21+',
  'Some parts 21+',
  'PG-13',
] as const
export type AgeRestriction = (typeof AGE_RESTRICTION_OPTIONS)[number]

export const createEventBaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description is too long')
    .transform((val) =>
      val.replace(/\[(.+?)\]\(([^)]+)\)/g, (match, text, url) => {
        if (url.startsWith('http://'))
          return `[${text}](${url.replace('http://', 'https://')})`
        if (!SAFE_LINK_PROTOCOLS.test(url)) return `[${text}](https://${url})`
        return match
      }),
    )
    .refine(
      (val) =>
        [...val.matchAll(/\[.+?\]\(([^)]+)\)/g)].every(([, url]) =>
          SAFE_LINK_PROTOCOLS.test(url),
        ),
      'Links must use https://, mailto:, or tel:',
    )
    .refine(
      (val) =>
        [...val.matchAll(/\[.+?\]\(([^)]+)\)/g)].every(([, url]) => {
          if (/^(mailto:|tel:)/.test(url)) return true
          return HAS_DOMAIN.test(url)
        }),
      'Links must contain a valid domain (e.g. example.com)',
    ),
  locationName: z.string().min(1, 'Location name is required').max(200),
  locationAddress: z.string().max(400).optional(),
  googleMapsUrl: z.string().url().optional().or(z.literal('')),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().optional(),
  flyerUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  ticketUrl: z
    .string()
    .transform((val) => {
      if (!val) return val
      if (val.startsWith('http://')) return val.replace('http://', 'https://')
      if (!/^https:\/\//.test(val)) return `https://${val}`
      return val
    })
    .pipe(z.string().url('Must be a valid URL'))
    .refine(
      (val) => !val || HTTPS_PROTOCOL.test(val),
      'Ticket URL must use https://',
    )
    .refine(
      (val) => !val || HAS_DOMAIN.test(val),
      'Must be a valid domain (e.g. eventbrite.com)',
    )
    .optional()
    .or(z.literal('')),
  shortDescription: z
    .string()
    .trim()
    .min(1, 'Short description is required')
    .min(10, 'Please add a short description (10–150 characters)')
    .max(150, 'Short description must be 150 characters or fewer'),
  emoji: z.string().trim().min(1, 'Please pick an emoji').max(10),
  vibeTags: z.array(z.enum(VIBE_TAGS)).default([]),
  requiresTicket: z.boolean().optional().default(false),
  ageRestriction: z.enum(AGE_RESTRICTION_OPTIONS).default('All ages'),
  dogsWelcome: z.boolean().optional().default(false),
})

export const createEventSchema = createEventBaseSchema
  .refine(
    (data) => {
      if (!data.endTime) return true
      return `${data.date}T${data.endTime}` >= `${data.date}T${data.startTime}`
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    },
  )
  .refine((data) => !data.ticketUrl || data.requiresTicket, {
    message: 'Ticket URL requires "Requires Ticket" to be enabled',
    path: ['ticketUrl'],
  })

export const updateEventSchema = createEventSchema

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
