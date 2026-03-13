export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function isBlobUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname.endsWith('.public.blob.vercel-storage.com')
  } catch {
    return false
  }
}
