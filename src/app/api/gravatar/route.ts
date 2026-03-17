import { NextRequest, NextResponse } from 'next/server'
import { getGravatarUrl } from '@/lib/gravatar'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) {
    return NextResponse.json({ url: null }, { status: 400 })
  }

  const url = getGravatarUrl(email)

  // Check if Gravatar exists (d=404 returns 404 if no avatar)
  try {
    const res = await fetch(url, { method: 'HEAD' })
    if (res.ok) {
      return NextResponse.json({ url })
    }
    return NextResponse.json({ url: null })
  } catch {
    return NextResponse.json({ url: null })
  }
}
