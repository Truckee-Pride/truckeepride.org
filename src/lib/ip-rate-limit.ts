/**
 * In-memory sliding window rate limiter.
 * Resets on deploy — acceptable for a small nonprofit site.
 */

const store = new Map<string, number[]>()

// Prune entries older than the window every 5 minutes
const PRUNE_INTERVAL = 5 * 60 * 1000

let pruneTimer: ReturnType<typeof setInterval> | null = null

function ensurePruning(windowMs: number) {
  if (pruneTimer) return
  pruneTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, timestamps] of store) {
      const filtered = timestamps.filter((t) => now - t < windowMs)
      if (filtered.length === 0) {
        store.delete(key)
      } else {
        store.set(key, filtered)
      }
    }
  }, PRUNE_INTERVAL)
  // Don't prevent process exit
  if (pruneTimer && typeof pruneTimer === 'object' && 'unref' in pruneTimer) {
    pruneTimer.unref()
  }
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  ensurePruning(windowMs)

  const now = Date.now()
  const timestamps = store.get(key) ?? []
  const recent = timestamps.filter((t) => now - t < windowMs)

  if (recent.length >= limit) {
    return { allowed: false, remaining: 0 }
  }

  recent.push(now)
  store.set(key, recent)
  return { allowed: true, remaining: limit - recent.length }
}

const ONE_HOUR = 60 * 60 * 1000

/** 5 account creations per IP per hour */
export function checkIpRateLimit(ip: string) {
  return checkRateLimit(`ip:${ip}`, 5, ONE_HOUR)
}

/** 3 magic link sends per email per hour */
export function checkEmailRateLimit(email: string) {
  return checkRateLimit(`email:${email.toLowerCase()}`, 3, ONE_HOUR)
}
