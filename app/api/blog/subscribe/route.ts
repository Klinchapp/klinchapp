import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const supabase = createClient()
    const cleanEmail = email.toLowerCase().trim()

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('blog_subscribers')
      .select('id, active')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (existing) {
      if (!existing.active) {
        // Reactivate previously unsubscribed user
        await supabase
          .from('blog_subscribers')
          .update({ active: true })
          .eq('email', cleanEmail)
        await sendWelcomeEmail(cleanEmail)
        return NextResponse.json({ message: 'Welcome back! You\'ve been re-subscribed.' })
      }
      return NextResponse.json({ message: 'Already subscribed' })
    }

    // Insert new subscriber
    const { error } = await supabase
      .from('blog_subscribers')
      .insert({ email: cleanEmail })

    if (error) {
      console.error('Subscribe error:', error)
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
    }

    // Send welcome email
    console.log('Attempting welcome email to:', cleanEmail)
    await sendWelcomeEmail(cleanEmail)

    return NextResponse.json({ message: 'Subscribed successfully' })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}

async function sendWelcomeEmail(email: string) {
  const apiKey = process.env.RESEND_API_KEY
  console.log('RESEND_API_KEY present:', !!apiKey)

  if (!apiKey) {
    console.error('No RESEND_API_KEY found in environment')
    return
  }

  try {
    const resend = new Resend(apiKey)

    const result = await resend.emails.send({
      from: 'Kira @ Klinchapp Blog <kira@klinchapp.com>',
      to: [email],
      subject: 'Welcome to the Klinchapp Blog',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px;">
          <div style="margin-bottom: 20px;">
            <img src="https://www.klinchapp.com/logo.jpg" alt="Klinchapp" style="height: 36px; width: auto; border-radius: 8px;" />
          </div>
          <p style="color: #333; margin: 0 0 16px 0;">Hi there,</p>
          <p style="color: #333; margin: 0 0 16px 0;">Thanks for subscribing to the Klinchapp blog. I'm Kira — an AI writer covering everything artificial intelligence, from practical tools to industry analysis and ethics.</p>
          <p style="color: #333; margin: 0 0 16px 0;">You'll receive a short email every time a new post goes live — <strong>twice a week</strong> (Tuesday and Friday). Just the title and a link. No noise.</p>
          <div style="background: #F3E8FF; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="font-weight: bold; color: #1a1a1a; margin: 0 0 8px 0;">Check out the latest posts:</p>
            <a href="https://www.klinchapp.com/blog" style="color: #6B2C6B; font-weight: 600;">Visit the blog →</a>
          </div>
          <p style="color: #999; font-size: 13px; margin-top: 24px;">You can <a href="https://www.klinchapp.com/api/blog/unsubscribe?email=${encodeURIComponent(email)}" style="color: #6B2C6B;">unsubscribe</a> at any time.</p>
        </div>
      `,
    })

    console.log('Resend response:', JSON.stringify(result))
  } catch (err) {
    console.error('Welcome email failed:', err)
  }
}
