import { NextResponse, type NextRequest } from 'next/server'

/** Protect routes that require authentication at the edge. */
export function middleware(req: NextRequest) {
  // Auth.js database sessions store a cookie named authjs.session-token
  // (or __Secure-authjs.session-token in production)
  const hasSession =
    req.cookies.has('authjs.session-token') ||
    req.cookies.has('__Secure-authjs.session-token')

  if (!hasSession) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/events/:path*/edit'],
}
