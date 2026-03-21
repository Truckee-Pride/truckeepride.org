/**
 * Timezone utilities for Truckee Pride events.
 * All events are in Truckee, CA — always use America/Los_Angeles.
 */

const TIMEZONE = 'America/Los_Angeles'

/**
 * Convert a date string ("2026-06-15") and time string ("14:00") intended as
 * Pacific time into a proper UTC Date object. This is critical because
 * `new Date("2026-06-15T14:00")` uses the server's local timezone, which is
 * UTC on Vercel — not Pacific.
 */
export function pacificToDate(dateStr: string, timeStr: string): Date {
  // Use noon UTC as a reference point (safely within the same calendar day
  // in Pacific, and far from any DST transition at 2 AM)
  const ref = new Date(`${dateStr}T12:00:00Z`)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    timeZoneName: 'longOffset',
  }).formatToParts(ref)
  const offset =
    parts.find((p) => p.type === 'timeZoneName')?.value.replace('GMT', '') ??
    '-08:00'
  return new Date(`${dateStr}T${timeStr}:00${offset}`)
}

/**
 * Format a UTC Date as a "YYYY-MM-DD" string in Pacific time.
 */
export function formatPacificDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
  return parts // en-CA formats as YYYY-MM-DD
}

/**
 * Format a UTC Date as an "HH:MM" string in Pacific time.
 */
export function formatPacificTime(date: Date): string {
  const h = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
  return h // "14:00" format
}
