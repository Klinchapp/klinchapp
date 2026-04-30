import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const NOTIFY_TO = 'klinchapp.info@gmail.com'

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, company } = await request.json()

    // Honeypot — bots tend to fill every field. Silently succeed.
    if (company && company.trim().length > 0) {
      return NextResponse.json({ message: 'Thanks — we\'ll be in touch.' })
    }

    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 254) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters' }, { status: 400 })
    }
    if (name.length > 200 || message.length > 5000) {
      return NextResponse.json({ error: 'Submission too long' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('Contact form: RESEND_API_KEY missing')
      return NextResponse.json({ error: 'Mail service unavailable' }, { status: 500 })
    }

    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()
    const cleanMessage = message.trim()

    const resend = new Resend(apiKey)

    await resend.emails.send({
      from: 'Klinchapp Contact <hello@klinchapp.com>',
      to: [NOTIFY_TO],
      replyTo: cleanEmail,
      subject: `Contact form: ${cleanName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px;">
          <h2 style="color: #6B2C6B; margin: 0 0 16px 0;">New contact form submission</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 90px;">Name</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-weight: 600;">${escapeHtml(cleanName)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Email</td>
              <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(cleanEmail)}" style="color: #6B2C6B;">${escapeHtml(cleanEmail)}</a></td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 16px; background: #F3E8FF; border-radius: 12px;">
            <p style="margin: 0; color: #1a1a1a; white-space: pre-wrap;">${escapeHtml(cleanMessage)}</p>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">Reply directly to this email — it will go to ${escapeHtml(cleanEmail)}.</p>
        </div>
      `,
    })

    return NextResponse.json({ message: 'Thanks — we\'ll be in touch.' })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
