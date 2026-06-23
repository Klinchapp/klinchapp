#!/usr/bin/env node
/**
 * Syndicates the latest published Klinchapp blog post to Bluesky as a skeet.
 *
 * Post format:
 *   <meta description>
 *
 *   klinchapp.com/blog/<slug>
 *
 * With a link card embed (OG image, title, description).
 * Dedup: checks recent posts for the URL before posting — never double-posts.
 *
 * Env vars required:
 *   BLUESKY_HANDLE          — klinchapp.com
 *   BLUESKY_APP_PASSWORD    — Bluesky app password
 */

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

try { process.loadEnvFile('.env.local') } catch {}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')
const SITE_URL = 'https://www.klinchapp.com'
const PDS_HOST = 'https://bsky.social'
const HANDLE = process.env.BLUESKY_HANDLE || 'klinchapp.com'

function log(msg) { console.log(`[syndicate-bluesky] ${msg}`) }
function fail(msg) { throw new Error(msg) }

// ─── ATProto helpers ──────────────────────────────────────────────────────────

async function createSession(identifier, appPassword) {
  const res = await fetch(`${PDS_HOST}/xrpc/com.atproto.server.createSession`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password: appPassword }),
  })
  if (!res.ok) fail(`ATProto auth failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function uploadBlob(session, imageBuffer, mimeType) {
  const res = await fetch(`${PDS_HOST}/xrpc/com.atproto.repo.uploadBlob`, {
    method: 'POST',
    headers: {
      'Content-Type': mimeType,
      'Authorization': `Bearer ${session.accessJwt}`,
    },
    body: imageBuffer,
  })
  if (!res.ok) fail(`uploadBlob failed: ${res.status} ${await res.text()}`)
  const { blob } = await res.json()
  return blob
}

async function createPost(session, record) {
  const res = await fetch(`${PDS_HOST}/xrpc/com.atproto.repo.createRecord`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.accessJwt}`,
    },
    body: JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record,
    }),
  })
  if (!res.ok) fail(`createRecord failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function getRecentPosts(session, limit = 20) {
  const res = await fetch(
    `${PDS_HOST}/xrpc/com.atproto.repo.listRecords?repo=${session.did}&collection=app.bsky.feed.post&limit=${limit}`,
    { headers: { 'Authorization': `Bearer ${session.accessJwt}` } }
  )
  if (!res.ok) return { records: [] }
  return res.json()
}

// ─── Content helpers ──────────────────────────────────────────────────────────

function getLatestPublishedPost() {
  if (!fs.existsSync(BLOG_DIR)) fail(`Blog dir not found: ${BLOG_DIR}`)
  return fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, f), 'utf-8')
      const { data, content } = matter(raw)
      return { data, content }
    })
    .filter(p => p.data.status === 'published')
    .sort((a, b) => new Date(b.data.publishedAt) - new Date(a.data.publishedAt))[0] || null
}

// AT Protocol uses UTF-8 byte offsets for facets, not character offsets
function byteLength(str) {
  return Buffer.byteLength(str, 'utf8')
}

function buildPostText(description, canonicalUrl) {
  // Keep display URL short — Bluesky shows the domain, the facet carries the full URL
  const displayUrl = canonicalUrl.replace('https://www.', '')
  const text = `${description}\n\n${displayUrl}`
  // Bluesky limit is 300 graphemes; descriptions are 120-155 chars so this always fits
  return { text, displayUrl }
}

function buildFacets(text, displayUrl, canonicalUrl) {
  // Find byte position of the display URL in the text
  const prefix = text.slice(0, text.lastIndexOf(displayUrl))
  const start = byteLength(prefix)
  const end = start + byteLength(displayUrl)
  return [{
    index: { byteStart: start, byteEnd: end },
    features: [{ $type: 'app.bsky.richtext.facet#link', uri: canonicalUrl }],
  }]
}

function getAllPublishedPosts() {
  if (!fs.existsSync(BLOG_DIR)) fail(`Blog dir not found: ${BLOG_DIR}`)
  return fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, f), 'utf-8')
      const { data, content } = matter(raw)
      return { data, content }
    })
    .filter(p => p.data.status === 'published')
    .sort((a, b) => new Date(a.data.publishedAt) - new Date(b.data.publishedAt))
}

async function postOne(session, data, postedSlugs) {
  const slug = data.slug
  const canonicalUrl = `${SITE_URL}/blog/${slug}`

  if (postedSlugs.has(slug)) {
    log(`  ⏭ ${slug} — already posted`)
    return false
  }

  const description = data.description || data.title
  const { text, displayUrl } = buildPostText(description, canonicalUrl)
  const facets = buildFacets(text, displayUrl, canonicalUrl)

  let thumb
  const ogImageUrl = `${SITE_URL}/blog/${slug}/opengraph-image`
  try {
    const imgRes = await fetch(ogImageUrl)
    if (imgRes.ok) {
      const imgBuffer = Buffer.from(await imgRes.arrayBuffer())
      const mimeType = imgRes.headers.get('content-type') || 'image/png'
      thumb = await uploadBlob(session, imgBuffer, mimeType)
    }
  } catch {}

  const embed = {
    $type: 'app.bsky.embed.external',
    external: {
      uri: canonicalUrl,
      title: data.title,
      description: description.slice(0, 300),
      ...(thumb ? { thumb } : {}),
    },
  }

  const record = {
    $type: 'app.bsky.feed.post',
    text,
    facets,
    embed,
    langs: ['en'],
    createdAt: new Date(data.publishedAt).toISOString(),
  }

  const result = await createPost(session, record)
  log(`  ✅ ${slug} → https://bsky.app/profile/${HANDLE}/post/${result.uri.split('/').pop()}`)
  return true
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { BLUESKY_APP_PASSWORD } = process.env
  if (!BLUESKY_APP_PASSWORD) fail('Missing env var: BLUESKY_APP_PASSWORD')

  const isBackfill = process.argv.includes('--backfill')

  log(`Authenticating as @${HANDLE}...`)
  const session = await createSession(HANDLE, BLUESKY_APP_PASSWORD)
  log(`Authenticated. DID: ${session.did}`)

  // Build set of already-posted slugs from recent posts
  log('Fetching existing posts for dedup...')
  const existing = await getRecentPosts(session, 100)
  const postedSlugs = new Set(
    existing.records
      .map(r => {
        const uri = r.value?.embed?.external?.uri || ''
        const m = uri.match(/\/blog\/([^/]+)$/)
        return m ? m[1] : null
      })
      .filter(Boolean)
  )
  log(`${postedSlugs.size} slugs already posted`)

  if (isBackfill) {
    const posts = getAllPublishedPosts()
    log(`\nBackfilling ${posts.length} published posts (oldest first)...\n`)
    let posted = 0
    for (const post of posts) {
      await postOne(session, post.data, postedSlugs)
      posted++
      // 15 minute gap between posts so they trickle naturally into feeds
      if (posted < posts.length) {
        log(`  ⏳ waiting 15 minutes before next post...`)
        await new Promise(r => setTimeout(r, 15 * 60 * 1000))
      }
    }
    log(`\nBackfill complete — ${posts.length} posts processed`)
    return
  }

  // Normal mode: post only the latest published post
  const post = getLatestPublishedPost()
  if (!post) fail('No published posts found')

  const { data } = post
  log(`Latest post: ${data.slug}`)
  await postOne(session, data, postedSlugs)
}

async function sendFailureAlert(errorMessage) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: 'Kira <kira@klinchapp.com>',
      to: ['klinchapp.info@gmail.com'],
      subject: '❌ Bluesky syndication FAILED',
      html: `
        <div style="font-family:sans-serif;max-width:520px;">
          <h2 style="color:#dc2626;">Bluesky syndication failed</h2>
          <p>The latest post published to the site, but did not reach Bluesky.</p>
          <p style="background:#fef2f2;padding:12px;border-radius:6px;color:#991b1b;font-family:monospace;font-size:13px;">${errorMessage}</p>
        </div>`,
    })
    log('Failure alert sent')
  } catch (e) {
    log(`Could not send failure alert: ${e.message}`)
  }
}

main().catch(async err => {
  const msg = err.message || String(err)
  console.error(`[syndicate-bluesky] ERROR: ${msg}`)
  await sendFailureAlert(msg)
  process.exit(1)
})
