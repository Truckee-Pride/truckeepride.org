const TZ = 'America/Los_Angeles'

/** "6/7/2026" */
export function numericDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

/** "Sat, Jun 7" */
export function shortDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

/** "Saturday, June 7" */
export function fullDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/** "Saturday, June 7, 2026" */
export function fullDateWithYear(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

/** "2:30 PM" */
export function time(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

/** "2026-06-07" — for grouping / comparison, not display */
export function dateKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}
