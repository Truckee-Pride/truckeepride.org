import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Rate limiter is created lazily so the app works without Upstash env vars
let ratelimit: Ratelimit | null = null
function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: false,
    prefix: 'places_autocomplete',
  })
  return ratelimit
}

export async function GET(req: NextRequest) {
  // 1. Auth check
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Rate limit check (per user)
  const limiter = getRatelimit()
  if (limiter) {
    const { success, limit, remaining, reset } = await limiter.limit(
      session.user.id,
    )
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before searching again.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(reset),
            'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
          },
        },
      )
    }
  }

  // 3. Validate input
  const input = req.nextUrl.searchParams.get('input')?.trim()
  if (!input || input.length < 2) {
    return NextResponse.json({ predictions: [] })
  }
  if (input.length > 200) {
    return NextResponse.json({ error: 'Input too long' }, { status: 400 })
  }

  // 4. Determine place types to search
  const typesParam = req.nextUrl.searchParams.get('types')
  const includedPrimaryTypes =
    typesParam === 'establishment'
      ? ['establishment']
      : typesParam === 'address'
        ? ['address']
        : ['address', 'establishment']

  // 5. Forward to Google Places API (New)
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    console.error('GOOGLE_PLACES_API_KEY is not set')
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  try {
    const response = await fetch(
      'https://places.googleapis.com/v1/places:autocomplete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
        },
        body: JSON.stringify({
          input,
          locationBias: {
            circle: {
              center: { latitude: 39.3277, longitude: -120.1833 },
              radius: 80000,
            },
          },
          includedPrimaryTypes,
        }),
      },
    )

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Google Places API error:', response.status, errorBody)
      return NextResponse.json(
        { error: 'Address lookup failed' },
        { status: 502 },
      )
    }

    const data = await response.json()

    const predictions = (data.suggestions ?? []).map(
      (s: {
        placePrediction?: {
          placeId?: string
          text?: { text?: string }
          structuredFormat?: {
            mainText?: { text?: string }
            secondaryText?: { text?: string }
          }
        }
      }) => ({
        placeId: s.placePrediction?.placeId,
        description: s.placePrediction?.text?.text,
        mainText: s.placePrediction?.structuredFormat?.mainText?.text,
        secondaryText: s.placePrediction?.structuredFormat?.secondaryText?.text,
      }),
    )

    return NextResponse.json({ predictions })
  } catch (err) {
    console.error('Places autocomplete fetch error:', err)
    return NextResponse.json(
      { error: 'Address lookup failed' },
      { status: 502 },
    )
  }
}
