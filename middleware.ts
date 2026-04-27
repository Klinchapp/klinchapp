import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''

  if (process.env.VERCEL_ENV === 'production' && host.endsWith('.vercel.app')) {
    const url = new URL(request.url)
    url.protocol = 'https:'
    url.host = 'www.klinchapp.com'
    return NextResponse.redirect(url, 308)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
