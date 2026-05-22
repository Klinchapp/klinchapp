#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

// Load .env.local for local runs (e.g. manual `node scripts/syndicate-to-wordpress.mjs`).
// In CI the file is absent and env vars come from the workflow's env block.
try { process.loadEnvFile('.env.local') } catch {}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')
const SITE_URL = 'https://www.klinchapp.com'

const {
  WORDPRESS_ACCESS_TOKEN,
  WORDPRESS_SITE_ID,
} = process.env

function log(msg) {
  console.log(`[syndicate-wordpress] ${msg}`)
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

async function postToWordPress(post) {
  const body = {
    title: post.data.title,
    content: buildBody(post),
    tags: (post.data.tags || []).join(','),
    status: 'publish',
  }
  const res = await fetch(
    `https://public-api.wordpress.com/rest/v1.1/sites/${encodeURIComponent(WORDPRESS_SITE_ID)}/posts/new`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WORDPRESS_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )
  if (!res.ok) fail(`WordPress API failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function main() {
  for (const k of ['WORDPRESS_ACCESS_TOKEN', 'WORDPRESS_SITE_ID']) {
    if (!process.env[k]) fail(`Missing env var: ${k}`)
  }

  const post = getLatestPublishedPost()
  if (!post) fail('No published posts found')
  log(`Latest post: ${post.data.slug} (${post.data.publishedAt})`)

  const result = await postToWordPress(post)
  log(`Posted to WordPress: ${result.URL || result.short_URL || result.ID}`)
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
    await resend.emails.send({
      from: 'Kira <kira@klinchapp.com>',
      to: ['klinchapp.info@gmail.com'],
      subject: '❌ WordPress syndication FAILED',
      html: `
        <div style="font-family: sans-serif; max-width: 520px;">
          <h2 style="color: #dc2626; margin-bottom: 4px;">WordPress syndication failed</h2>
          <p>The latest post published to the site, but did not reach WordPress.com.</p>
          <p style="background:#fef2f2;padding:12px;border-radius:6px;color:#991b1b;font-family:monospace;font-size:13px;">${errorMessage}</p>
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
  console.error(`[syndicate-wordpress] ERROR: ${msg}`)
  await sendFailureAlert(msg)
  process.exit(1)
})
