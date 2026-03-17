import { z } from 'zod'

const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .transform((val) => val.replace(/\D/g, ''))
  .pipe(
    z
      .string()
      .min(10, 'Phone number must be at least 10 digits')
      .max(15, 'Phone number is too long')
      .regex(/^\d+$/, 'Phone number must contain only digits'),
  )

export const accountFieldsSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .max(254, 'Email is too long')
    .transform((val) => val.toLowerCase().trim()),
  phone: phoneSchema,
})

export type AccountFieldsInput = z.infer<typeof accountFieldsSchema>
