#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

// Load .env.local for local runs (e.g. manual `node scripts/syndicate-to-blogger.mjs`).
// In CI the file is absent and env vars come from the workflow's env block.
try { process.loadEnvFile('.env.local') } catch {}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')
const SITE_URL = 'https://www.klinchapp.com'

const {
  BLOGGER_CLIENT_ID,
  BLOGGER_CLIENT_SECRET,
  BLOGGER_REFRESH_TOKEN,
  BLOGGER_BLOG_ID,
} = process.env

function log(msg) {
  console.log(`[syndicate-blogger] ${msg}`)
}

function fail(msg) {
  throw new Error(msg)
}

function getLatestPublishedPost() {
  if (!fs.existsSync(BLOG_DIR)) fail(`Blog dir not found: ${BLOG_DIR}`)
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'))
  const posts = files
    .map(f => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, f), 'utf-8')
      const { data, content } = matter(raw)
      return { file: f, data, content }
    })
    .filter(p => p.data.status === 'published')
    .sort((a, b) => new Date(b.data.publishedAt) - new Date(a.data.publishedAt))
  return posts[0] || null
}

function mdParagraphsToHtml(markdown, paragraphCount = 3) {
  const lines = markdown.split('\n')
  const paragraphs = []
  let buf = []
  let inCodeBlock = false

  for (const line of lines) {
    if (line.startsWith('```')) { inCodeBlock = !inCodeBlock; continue }
    if (inCodeBlock) continue
    if (line.startsWith('#')) { if (buf.length) { paragraphs.push(buf.join(' ').trim()); buf = [] } continue }
    if (line.trim() === '') { if (buf.length) { paragraphs.push(buf.join(' ').trim()); buf = [] } continue }
    if (/^[\-\*]\s/.test(line) || /^\d+\.\s/.test(line.trim())) continue
    buf.push(line.trim())
  }
  if (buf.length) paragraphs.push(buf.join(' ').trim())

  return paragraphs
    .filter(p => p.length > 40)
    .slice(0, paragraphCount)
    .map(p => `<p>${inlineMdToHtml(p)}</p>`)
    .join('\n')
}

function inlineMdToHtml(text) {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

function buildBody(post) {
  const { data, content } = post
  const teaserHtml = mdParagraphsToHtml(content, 3)
  const canonicalUrl = `${SITE_URL}/blog/${data.slug}`
  return `${teaserHtml}
<p><a href="${canonicalUrl}"><strong>Read the full post on Klinchapp →</strong></a></p>
<p style="color:#888;font-size:0.9em;">Originally published on the <a href="${SITE_URL}/blog">Klinchapp blog</a> by Kira, our AI content specialist.</p>`
}

async function getAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: BLOGGER_CLIENT_ID,
      client_secret: BLOGGER_CLIENT_SECRET,
      refresh_token: BLOGGER_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) fail(`OAuth token refresh failed: ${res.status} ${await res.text()}`)
  const json = await res.json()
  return json.access_token
}

async function postToBlogger(accessToken, post) {
  const body = {
    kind: 'blogger#post',
    title: post.data.title,
    content: buildBody(post),
    labels: post.data.tags || [],
  }
  const res = await fetch(
    `https://www.googleapis.com/blogger/v3/blogs/${BLOGGER_BLOG_ID}/posts/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )
  if (!res.ok) fail(`Blogger API failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function main() {
  for (const k of ['BLOGGER_CLIENT_ID', 'BLOGGER_CLIENT_SECRET', 'BLOGGER_REFRESH_TOKEN', 'BLOGGER_BLOG_ID']) {
    if (!process.env[k]) fail(`Missing env var: ${k}`)
  }

  const post = getLatestPublishedPost()
  if (!post) fail('No published posts found')
  log(`Latest post: ${post.data.slug} (${post.data.publishedAt})`)

  const accessToken = await getAccessToken()
  log('Got OAuth access token')

  const result = await postToBlogger(accessToken, post)
  log(`Posted to Blogger: ${result.url}`)
}

async function sendFailureAlert(errorMessage) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    log('No RESEND_API_KEY — skipping failure alert email')
    return
  }
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)
    const isInvalidGrant = /invalid_grant/.test(errorMessage)
    await resend.emails.send({
      from: 'Kira <kira@klinchapp.com>',
      to: ['klinchapp.info@gmail.com'],
      subject: '❌ Blogger syndication FAILED',
      html: `
        <div style="font-family: sans-serif; max-width: 520px;">
          <h2 style="color: #dc2626; margin-bottom: 4px;">Blogger syndication failed</h2>
          <p>The latest post published to the site (and WordPress), but did not reach Blogger.</p>
          <p style="background:#fef2f2;padding:12px;border-radius:6px;color:#991b1b;font-family:monospace;font-size:13px;">${errorMessage}</p>
          ${isInvalidGrant ? `<p style="color:#991b1b;font-size:13px;"><strong>This is an OAuth <code>invalid_grant</code> error — the Blogger refresh token has expired.</strong> Regenerate it and update the <code>BLOGGER_REFRESH_TOKEN</code> GitHub secret. See <code>scripts/BLOGGER_API_SETUP.md</code>. If the OAuth app is still in "Testing" mode, push it to "In production" to stop the 7-day expiry.</p>` : ''}
        </div>
      `,
    })
    log('Failure alert email sent')
  } catch (mailErr) {
    log(`Could not send failure alert: ${mailErr.message}`)
  }
}

main().catch(async (err) => {
  const msg = err.message || String(err)
  console.error(`[syndicate-blogger] ERROR: ${msg}`)
  await sendFailureAlert(msg)
  process.exit(1)
})
