import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')

  if (!email) {
    return new NextResponse(renderPage('Missing email', 'No email address was provided.', false), {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  const supabase = createClient()

  const { error } = await supabase
    .from('blog_subscribers')
    .update({ active: false })
    .eq('email', email.toLowerCase().trim())

  if (error) {
    return new NextResponse(renderPage('Something went wrong', 'We couldn\'t process your request. Please try again later.', false), {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  return new NextResponse(renderPage('Unsubscribed', 'You\'ve been unsubscribed from the Klinchapp blog. You won\'t receive any more emails from us.', true), {
    headers: { 'Content-Type': 'text/html' },
  })
}

function renderPage(title: string, message: string, success: boolean) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Klinchapp</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: linear-gradient(135deg, #FDFAFF, #FDF2F8, #FFF8F8); }
    .card { background: white; border-radius: 16px; padding: 48px; max-width: 420px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid #f3f4f6; }
    h1 { color: ${success ? '#6B2C6B' : '#dc2626'}; margin: 0 0 12px 0; font-size: 24px; }
    p { color: #666; margin: 0 0 24px 0; line-height: 1.6; }
    a { color: #6B2C6B; font-weight: 600; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/blog">← Back to blog</a>
  </div>
</body>
</html>`
}
