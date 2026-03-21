import { HAS_DOMAIN } from '@/lib/constants'

/** Normalize a user-entered URL: upgrade http → https and prepend https:// if missing. */
export function normalizeUrl(raw: string): string {
  let url = raw.trim()
  if (!url) return url
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://')
  } else if (!/^https:\/\//.test(url)) {
    url = `https://${url}`
  }
  return url
}

const INVALID_DOMAIN_MESSAGE = 'Must contain a valid domain (e.g. example.com)'

/** Normalize a URL and validate it has a real domain. Returns { url, error }. */
export function validateUrl(raw: string): {
  url: string
  error: string | null
} {
  const url = normalizeUrl(raw)
  if (!url) return { url, error: null }
  if (!HAS_DOMAIN.test(url)) return { url, error: INVALID_DOMAIN_MESSAGE }
  return { url, error: null }
}
