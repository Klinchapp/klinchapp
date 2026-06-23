#!/usr/bin/env node
/**
 * Syndicates the latest published Klinchapp blog post to Leaflet.pub via
 * AT Protocol standard.site lexicon.
 *
 * Creates a site.standard.document record in the klinchapp.com AT Protocol
 * repo, which Leaflet.pub (and other AT Protocol blog readers) can discover.
 *
 * First-time setup:
 *   node scripts/syndicate-to-leaflet.mjs --setup
 *   → creates the site.standard.publication record and prints the AT-URI.
 *   → set ATPROTO_PUBLICATION_URI in .env.local + Vercel + GitHub secrets.
 *   → deploy to Vercel so /.well-known/site.standard.publication is live
 *     (verifies domain ownership of klinchapp.com/blog to Leaflet.pub).
 *
 * Normal run (called by blog-publish.yml after a new post is committed):
 *   node scripts/syndicate-to-leaflet.mjs
 *
 * Env vars required:
 *   BLUESKY_APP_PASSWORD        — Bluesky app password for @klinchapp.com
 *   ATPROTO_PUBLICATION_URI     — AT-URI of the publication record (after setup)
 */

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

try { process.loadEnvFile('.env.local') } catch {}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')
const SITE_URL = 'https://www.klinchapp.com'
const HANDLE = 'klinchapp.com'
const PDS_HOST = 'https://bsky.social'

function log(msg) { console.log(`[syndicate-leaflet] ${msg}`) }
function fail(msg) { throw new Error(msg) }

// ─── ATProto helpers ─────────────────────────────────────────────────────────

async function createSession(identifier, appPassword) {
  const res = await fetch(`${PDS_HOST}/xrpc/com.atproto.server.createSession`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password: appPassword }),
  })
  if (!res.ok) fail(`ATProto auth failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function createRecord(session, collection, record) {
  const res = await fetch(`${PDS_HOST}/xrpc/com.atproto.repo.createRecord`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.accessJwt}`,
    },
    body: JSON.stringify({ repo: session.did, collection, record }),
  })
  if (!res.ok) fail(`createRecord(${collection}) failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function putRecord(session, collection, rkey, record) {
  const res = await fetch(`${PDS_HOST}/xrpc/com.atproto.repo.putRecord`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.accessJwt}`,
    },
    body: JSON.stringify({ repo: session.did, collection, rkey, record }),
  })
  if (!res.ok) fail(`putRecord(${collection}/${rkey}) failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function listRecords(session, collection) {
  const res = await fetch(
    `${PDS_HOST}/xrpc/com.atproto.repo.listRecords?repo=${session.did}&collection=${encodeURIComponent(collection)}&limit=10`,
    { headers: { 'Authorization': `Bearer ${session.accessJwt}` } }
  )
  if (!res.ok) fail(`listRecords(${collection}) failed: ${res.status} ${await res.text()}`)
  return res.json()
}

// ─── Content helpers ──────────────────────────────────────────────────────────

function getLatestPublishedPost() {
  if (!fs.existsSync(BLOG_DIR)) fail(`Blog dir not found: ${BLOG_DIR}`)
  const posts = fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, f), 'utf-8')
      const { data, content } = matter(raw)
      return { data, content }
    })
    .filter(p => p.data.status === 'published')
    .sort((a, b) => new Date(b.data.publishedAt) - new Date(a.data.publishedAt))
  return posts[0] || null
}

// Strip MDX/markdown to plain text for the textContent field
function stripToPlainText(mdx, maxChars = 3000) {
  return mdx
    .replace(/^---[\s\S]*?---\n?/, '')   // frontmatter
    .replace(/```[\s\S]*?```/g, '')       // code blocks
    .replace(/^#{1,6}\s+/gm, '')          // headings
    .replace(/!\[.*?\]\(.*?\)/g, '')      // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → text
    .replace(/[*_~`]/g, '')               // inline formatting
    .replace(/^\s*[-*+]\s+/gm, '')        // list markers
    .replace(/^\s*\d+\.\s+/gm, '')        // numbered list markers
    .replace(/\n{3,}/g, '\n\n')           // collapse blank lines
    .trim()
    .slice(0, maxChars)
}

// ─── Setup: create publication record ────────────────────────────────────────

async function setup(session) {
  log('Checking for existing publication records...')
  const existing = await listRecords(session, 'site.standard.publication')

  if (existing.records && existing.records.length > 0) {
    const rec = existing.records[0]
    log(`Publication already exists: ${rec.uri}`)
    log(`Set ATPROTO_PUBLICATION_URI=${rec.uri}`)
    return rec.uri
  }

  log('Creating site.standard.publication record...')
  const result = await createRecord(session, 'site.standard.publication', {
    $type: 'site.standard.publication',
    name: 'Klinchapp Blog',
    url: `${SITE_URL}/blog`,
    description: 'AI-powered social media tips and tools — by Kira, Klinchapp\'s AI content specialist.',
  })

  log(`Publication created: ${result.uri}`)
  log('')
  log('━━━ Next steps ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  log(`1. Add to .env.local:`)
  log(`   ATPROTO_PUBLICATION_URI=${result.uri}`)
  log(`2. Add to Vercel environment variables (Production):`)
  log(`   ATPROTO_PUBLICATION_URI=${result.uri}`)
  log(`3. Add to GitHub repository secrets:`)
  log(`   ATPROTO_PUBLICATION_URI=${result.uri}`)
  log(`4. Push a deploy so /.well-known/site.standard.publication goes live.`)
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  return result.uri
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { BLUESKY_APP_PASSWORD, ATPROTO_PUBLICATION_URI } = process.env

  if (!BLUESKY_APP_PASSWORD) fail('Missing env var: BLUESKY_APP_PASSWORD')

  log(`Authenticating as @${HANDLE}...`)
  const session = await createSession(HANDLE, BLUESKY_APP_PASSWORD)
  log(`Authenticated. DID: ${session.did}`)

  const isSetup = process.argv.includes('--setup')

  if (isSetup) {
    await setup(session)
    return
  }

  if (!ATPROTO_PUBLICATION_URI) {
    fail('Missing ATPROTO_PUBLICATION_URI — run with --setup first to create the publication record.')
  }

  const post = getLatestPublishedPost()
  if (!post) fail('No published posts found')

  const { data, content } = post
  log(`Latest post: ${data.slug} (${data.publishedAt})`)

  const docRecord = {
    $type: 'site.standard.document',
    site: ATPROTO_PUBLICATION_URI,
    title: data.title,
    publishedAt: new Date(data.publishedAt).toISOString(),
    path: `/blog/${data.slug}`,
    description: data.description || '',
    tags: data.tags || [],
    textContent: stripToPlainText(content),
  }

  log('Creating site.standard.document record...')
  const result = await createRecord(session, 'site.standard.document', docRecord)
  log(`Document created: ${result.uri}`)
  log(`View on Leaflet: https://leaflet.pub/${result.uri.replace('at://', '')}`)
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
      subject: '❌ Leaflet syndication FAILED',
      html: `
        <div style="font-family: sans-serif; max-width: 520px;">
          <h2 style="color: #dc2626; margin-bottom: 4px;">Leaflet syndication failed</h2>
          <p>The latest post published to the site, but did not reach Leaflet.pub.</p>
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
  console.error(`[syndicate-leaflet] ERROR: ${msg}`)
  await sendFailureAlert(msg)
  process.exit(1)
})
