import { NextResponse } from 'next/server'

export function GET() {
  const uri = process.env.ATPROTO_PUBLICATION_URI
  if (!uri) return new NextResponse('', { status: 404 })
  return new NextResponse(uri, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
