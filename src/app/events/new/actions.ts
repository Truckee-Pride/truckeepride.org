'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { signIn } from '@/lib/auth'
import { requireUser } from '@/lib/auth-stub'
import { db } from '@/lib/db'
import { events, users, auditLog } from '@/db/schema'
import { getSignupsEnabled } from '@/lib/site-settings'
import { computeName } from '@/lib/models/user'
import { createEventSchema, type CreateEventInput } from '@/lib/schemas/events'
import { accountFieldsSchema } from '@/lib/schemas/account'
import { generateSlug, ensureUniqueSlug } from '@/lib/slug'
import { isBlobUrl } from '@/lib/upload'
import { pacificToDate } from '@/lib/timezone'
import { checkPendingEventLimit } from '@/lib/rate-limit'
import { checkIpRateLimit, checkEmailRateLimit } from '@/lib/ip-rate-limit'
import { getGravatarUrl } from '@/lib/gravatar'

// ── Create Event ──────────────────────────────────────────────────────

export type CreateEventState = {
  success: boolean
  error?: string
  fieldErrors?: Partial<Record<keyof CreateEventInput, string[]>>
}

export async function createEvent(
  _prev: CreateEventState,
  formData: FormData,
): Promise<CreateEventState> {
  const user = await requireUser()

  const rateLimit = await checkPendingEventLimit(user.id)
  if (!rateLimit.allowed) {
    return {
      success: false,
      error:
        'You have too many pending events. Please wait for existing submissions to be reviewed.',
    }
  }

  const raw = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    locationName: formData.get('locationName') as string,
    locationAddress: (formData.get('locationAddress') as string) || undefined,
    date: formData.get('date') as string,
    startTime: formData.get('startTime') as string,
    endTime: (formData.get('endTime') as string) || undefined,
    flyerUrl: (formData.get('flyerUrl') as string) || undefined,
    ticketUrl: (formData.get('ticketUrl') as string) || undefined,
    shortDescription: formData.get('shortDescription') as string,
    emoji: formData.get('emoji') as string,
    vibeTags: formData.getAll('vibeTags') as string[],
    requiresTicket: formData.get('requiresTicket') === 'on',
    ageRestriction: formData.get('ageRestriction') as string,
    dogsWelcome: formData.get('dogsWelcome') === 'on',
  }

  const result = createEventSchema.safeParse(raw)
  if (!result.success) {
    return {
      success: false,
      fieldErrors: result.error.flatten().fieldErrors as Partial<
        Record<keyof CreateEventInput, string[]>
      >,
    }
  }

  const data = result.data

  // Validate flyerUrl is either empty or a blob URL
  if (data.flyerUrl && !isBlobUrl(data.flyerUrl)) {
    return {
      success: false,
      fieldErrors: { flyerUrl: ['Invalid image URL'] } as Partial<
        Record<keyof CreateEventInput, string[]>
      >,
    }
  }

  const baseSlug = generateSlug(data.title)
  const slug = await ensureUniqueSlug(baseSlug)

  const startTime = pacificToDate(data.date, data.startTime)
  const endTime = data.endTime
    ? pacificToDate(data.date, data.endTime)
    : undefined

  const [event] = await db
    .insert(events)
    .values({
      slug,
      title: data.title,
      description: data.description,
      locationName: data.locationName,
      locationAddress: data.locationAddress ?? null,
      startTime,
      endTime,
      flyerUrl: data.flyerUrl ?? null,
      ticketUrl: data.ticketUrl ?? null,
      shortDescription: data.shortDescription,
      emoji: data.emoji,
      vibeTags: data.vibeTags,
      requiresTicket: data.requiresTicket,
      ageRestriction: data.ageRestriction,
      dogsWelcome: data.dogsWelcome,
      status: 'draft',
      ownerId: user.id,
    })
    .returning({ id: events.id, slug: events.slug })

  await db.insert(auditLog).values({
    action: 'create',
    userId: user.id,
    targetType: 'event',
    targetId: event.id,
  })

  redirect(`/events/${event.slug}/confirm`)
}

// ── Submit Event for Review ───────────────────────────────────────────

export async function submitEventForReview(
  eventId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  })
  if (!event) return { success: false, error: 'Event not found' }
  if (event.ownerId !== userId) {
    return { success: false, error: 'You do not own this event' }
  }

  const [updated] = await db
    .update(events)
    .set({ status: 'pending', updatedAt: new Date() })
    .where(eq(events.id, eventId))
    .returning({ id: events.id })

  if (!updated) {
    return { success: false, error: 'Failed to submit event for review' }
  }

  await db.insert(auditLog).values({
    action: 'submit_for_review',
    userId,
    targetType: 'event',
    targetId: eventId,
  })

  revalidatePath('/', 'layout')
  return { success: true }
}

// ── Account Creation & Sign In ────────────────────────────────────────

export type AccountActionState = {
  success: boolean
  email?: string
  error?: string
  fieldErrors?: Partial<Record<string, string[]>>
}

async function getClientIp(): Promise<string> {
  const hdrs = await headers()
  return hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

export async function createAccountAndSignIn(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const ip = await getClientIp()
  const ipCheck = checkIpRateLimit(ip)
  if (!ipCheck.allowed) {
    return {
      success: false,
      error: 'Too many requests. Please try again later.',
    }
  }

  const signupsEnabled = await getSignupsEnabled()
  if (!signupsEnabled) {
    return {
      success: false,
      error:
        'New sign-ups are temporarily closed. If you already have an account, please sign in instead.',
    }
  }

  const raw = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
  }

  const result = accountFieldsSchema.safeParse(raw)
  if (!result.success) {
    return {
      success: false,
      fieldErrors: result.error.flatten().fieldErrors,
    }
  }

  const data = result.data
  const redirectTo = (formData.get('redirectTo') as string) || '/events/new'
  const gravatarUrl = (formData.get('gravatarUrl') as string) || null

  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  })

  if (existingUser) {
    // Update null profile fields (don't overwrite existing data)
    const updates: Record<string, string> = {}
    if (!existingUser.firstName) updates.firstName = data.firstName
    if (!existingUser.lastName) updates.lastName = data.lastName
    if (!existingUser.phone) updates.phone = data.phone
    if (!existingUser.image && gravatarUrl) updates.image = gravatarUrl

    if (Object.keys(updates).length > 0) {
      const effectiveFirst = updates.firstName ?? existingUser.firstName
      const effectiveLast = updates.lastName ?? existingUser.lastName
      await db
        .update(users)
        .set({
          ...updates,
          name: computeName(effectiveFirst, effectiveLast),
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
    }
  } else {
    // Resolve Gravatar URL if not provided by client
    let imageUrl = gravatarUrl
    if (!imageUrl) {
      const gUrl = getGravatarUrl(data.email)
      try {
        const res = await fetch(gUrl, { method: 'HEAD' })
        if (res.ok) imageUrl = gUrl
      } catch {
        // No gravatar — that's fine
      }
    }

    await db.insert(users).values({
      name: computeName(data.firstName, data.lastName),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      image: imageUrl,
      role: 'user',
    })
  }

  // Rate limit magic link sends per email
  const emailCheck = checkEmailRateLimit(data.email)
  if (!emailCheck.allowed) {
    return {
      success: false,
      error:
        'Too many sign-in attempts for this email. Please try again later.',
    }
  }

  // Send magic link
  await signIn('resend', {
    email: data.email,
    redirectTo,
    redirect: false,
  })

  return { success: true, email: data.email }
}

export async function sendSignInLink(
  _prev: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const ip = await getClientIp()
  const ipCheck = checkIpRateLimit(ip)
  if (!ipCheck.allowed) {
    return {
      success: false,
      error: 'Too many requests. Please try again later.',
    }
  }

  const email = (formData.get('email') as string)?.toLowerCase().trim()
  if (!email || !email.includes('@')) {
    return {
      success: false,
      fieldErrors: { email: ['Enter a valid email address'] },
    }
  }

  const emailCheck = checkEmailRateLimit(email)
  if (!emailCheck.allowed) {
    return {
      success: false,
      error:
        'Too many sign-in attempts for this email. Please try again later.',
    }
  }

  const redirectTo = (formData.get('redirectTo') as string) || '/events/new'

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  })

  if (existing) {
    await signIn('resend', {
      email,
      redirectTo,
      redirect: false,
    })
  }

  return { success: true, email }
}
