import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  
  // Only handle GET requests
  if (request.method !== 'GET') {
    return NextResponse.next()
  }

  // Handle www to non-www redirect
  if (url.hostname.startsWith('www.')) {
    url.hostname = url.hostname.replace(/^www\./, '')
    return NextResponse.redirect(url)
  }

  // Normalize double slashes in path
  if (url.pathname.match(/\/\/+/)) {
    url.pathname = url.pathname.replace(/\/\/+/g, '/')
    return NextResponse.redirect(url)
  }

  // Add trailing slash if missing (except for files with extensions)
  if (!url.pathname.match(/\.[a-zA-Z0-9]+$/)) {
    if (!url.pathname.endsWith('/') && url.pathname !== '/') {
      url.pathname = `${url.pathname}/`
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// Configure which paths the middleware will run on
export const config = {
  matcher: [
    // Match all paths except static files, api routes, and _next
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 