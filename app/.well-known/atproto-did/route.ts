import { NextResponse } from 'next/server'

export function GET() {
  return new NextResponse('did:plc:a4f2ydt43slmk3iyvypgsr3d', {
    headers: { 'Content-Type': 'text/plain' },
  })
}
