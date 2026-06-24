#!/usr/bin/env node
/**
 * Syndicates Klinchapp blog posts to Leaflet.pub via AT Protocol standard.site lexicon.
 *
 * Leaflet post structure (per strategy doc):
 *   1. Answer-first paragraph
 *   2. 3-4 key sections from the post
 *   3. FAQ block (first 3 Q&A pairs)
 *   4. Link to full post on klinchapp.com
 *
 * Usage:
 *   node scripts/syndicate-to-leaflet.mjs              # post latest published post
 *   node scripts/syndicate-to-leaflet.mjs --setup      # create publication record
 *   node scripts/syndicate-to-leaflet.mjs --update-all # re-push all published posts
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

// Fetches all existing document records, paginating with cursor
async function getAllDocumentRecords(session) {
  const records = []
  let cursor
  do {
    const url = new URL(`${PDS_HOST}/xrpc/com.atproto.repo.listRecords`)
    url.searchParams.set('repo', session.did)
    url.searchParams.set('collection', 'site.standard.document')
    url.searchParams.set('limit', '100')
    if (cursor) url.searchParams.set('cursor', cursor)
    const res = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${session.accessJwt}` },
    })
    if (!res.ok) fail(`listRecords failed: ${res.status} ${await res.text()}`)
    const data = await res.json()
    records.push(...(data.records || []))
    cursor = data.cursor
  } while (cursor)
  return records
}

async function listPublicationRecords(session) {
  const res = await fetch(
    `${PDS_HOST}/xrpc/com.atproto.repo.listRecords?repo=${session.did}&collection=${encodeURIComponent('site.standard.publication')}&limit=10`,
    { headers: { 'Authorization': `Bearer ${session.accessJwt}` } }
  )
  if (!res.ok) fail(`listRecords(publication) failed: ${res.status} ${await res.text()}`)
  return res.json()
}

// ─── Content helpers ──────────────────────────────────────────────────────────

function getLatestPublishedPost() {
  return getAllPublishedPosts()[0] || null
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
    .sort((a, b) => new Date(b.data.publishedAt) - new Date(a.data.publishedAt))
}

// Builds structured Leaflet content per strategy doc:
//   1. Answer-first paragraph
//   2. 3-4 key H2 sections (heading + first paragraph)
//   3. FAQ block (first 3 Q&A pairs)
//   4. Link to full post
function buildStructuredContent(content, slug) {
  const lines = content.split('\n')
  const parts = []

  // 1. Answer-first paragraph — first non-empty paragraph after H1
  const h1Idx = lines.findIndex(l => /^#\s+/.test(l))
  const startIdx = h1Idx !== -1 ? h1Idx + 1 : 0
  let i = startIdx
  while (i < lines.length && lines[i].trim() === '') i++
  const answerLines = []
  while (i < lines.length && lines[i].trim() !== '') {
    answerLines.push(lines[i].trim())
    i++
  }
  if (answerLines.length) parts.push(answerLines.join(' '))

  // 2. 3-4 key H2 sections (skip FAQ, References, Tags)
  const SKIP = /^##\s+(frequently asked questions|faq|references|tags)/i
  const sections = []
  let currentHeading = null
  let collecting = false
  const paraLines = []

  for (const line of lines) {
    if (/^##\s+/.test(line) && !/^###/.test(line)) {
      if (currentHeading && paraLines.length) {
        sections.push({ heading: currentHeading, para: paraLines.join(' ').trim() })
        paraLines.length = 0
      }
      if (SKIP.test(line)) {
        currentHeading = null
        collecting = false
      } else {
        currentHeading = line.replace(/^##\s+/, '').trim()
        collecting = true
      }
    } else if (collecting && currentHeading) {
      if (paraLines.length === 0 && line.trim() === '') {
        // skip leading blank
      } else if (line.trim() === '' && paraLines.length > 0) {
        // end of first paragraph — stop collecting this section
        collecting = false
      } else if (line.trim()) {
        paraLines.push(line.trim())
      }
    }
  }
  if (currentHeading && paraLines.length) {
    sections.push({ heading: currentHeading, para: paraLines.join(' ').trim() })
  }

  for (const s of sections.slice(0, 4)) {
    parts.push(`${s.heading}\n${s.para}`)
  }

  // 3. FAQ block — first 3 Q&A pairs
  const faqStart = lines.findIndex(l => /^##\s+(frequently asked questions|faq)/i.test(l))
  if (faqStart !== -1) {
    const pairs = []
    let q = null
    const aLines = []
    for (let j = faqStart + 1; j < lines.length; j++) {
      const line = lines[j]
      if (/^##\s+/.test(line) && !/^###/.test(line)) break
      if (/^###\s+/.test(line)) {
        if (q && aLines.length) pairs.push({ q, a: aLines.join(' ').trim() })
        q = line.replace(/^###\s+/, '').trim()
        aLines.length = 0
      } else if (q && line.trim()) {
        aLines.push(line.trim())
      }
    }
    if (q && aLines.length) pairs.push({ q, a: aLines.join(' ').trim() })
    if (pairs.length) {
      const faqText = pairs.slice(0, 3).map(p => `${p.q}\n${p.a}`).join('\n\n')
      parts.push(`Frequently asked questions\n\n${faqText}`)
    }
  }

  // 4. Link to full post
  parts.push(`Read the full post: ${SITE_URL}/blog/${slug}`)

  return parts.join('\n\n')
}

function buildDocRecord(data, content, publicationUri) {
  return {
    $type: 'site.standard.document',
    site: publicationUri,
    title: data.title,
    publishedAt: new Date(data.publishedAt).toISOString(),
    path: `/blog/${data.slug}`,
    description: data.description || '',
    tags: data.tags || [],
    textContent: buildStructuredContent(content, data.slug),
  }
}

// ─── Setup ────────────────────────────────────────────────────────────────────

async function setup(session) {
  log('Checking for existing publication records...')
  const existing = await listPublicationRecords(session)
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
    url: SITE_URL,
    description: "AI content strategy, tools, and industry analysis — produced by Klinchapp. Direct, opinionated, research-backed.",
  })
  log(`Publication created: ${result.uri}`)
  log(`Set ATPROTO_PUBLICATION_URI=${result.uri}`)
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
  const isUpdateAll = process.argv.includes('--update-all')

  if (isSetup) {
    await setup(session)
    return
  }

  if (!ATPROTO_PUBLICATION_URI) {
    fail('Missing ATPROTO_PUBLICATION_URI — run with --setup first.')
  }

  if (isUpdateAll) {
    log('Fetching all existing document records...')
    const existing = await getAllDocumentRecords(session)
    // Build path → rkey map for existing records
    const pathToRkey = {}
    for (const rec of existing) {
      const p = rec.value?.path
      if (p) pathToRkey[p] = rec.uri.split('/').pop()
    }
    log(`Found ${existing.length} existing records`)

    const posts = getAllPublishedPosts()
    log(`Processing ${posts.length} published posts...\n`)
    let updated = 0, created = 0

    for (const { data, content } of posts) {
      const docPath = `/blog/${data.slug}`
      const docRecord = buildDocRecord(data, content, ATPROTO_PUBLICATION_URI)
      const existingRkey = pathToRkey[docPath]

      if (existingRkey) {
        await putRecord(session, 'site.standard.document', existingRkey, docRecord)
        log(`  ↺ updated: ${data.slug}`)
        updated++
      } else {
        const result = await createRecord(session, 'site.standard.document', docRecord)
        log(`  ✅ created: ${data.slug} → ${result.uri}`)
        created++
      }
    }

    log(`\nDone — updated: ${updated} | created: ${created}`)
    return
  }

  // Normal mode: post the latest published post
  const post = getLatestPublishedPost()
  if (!post) fail('No published posts found')

  const { data, content } = post
  log(`Latest post: ${data.slug} (${data.publishedAt})`)

  const docRecord = buildDocRecord(data, content, ATPROTO_PUBLICATION_URI)
  const docPath = `/blog/${data.slug}`

  log('Checking for existing record...')
  const existingRecords = await getAllDocumentRecords(session)
  const existingRec = existingRecords.find(r => r.value?.path === docPath)

  if (existingRec) {
    const rkey = existingRec.uri.split('/').pop()
    await putRecord(session, 'site.standard.document', rkey, docRecord)
    log(`Document updated: ${existingRec.uri}`)
  } else {
    const result = await createRecord(session, 'site.standard.document', docRecord)
    log(`Document created: ${result.uri}`)
  }
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
      subject: '❌ Leaflet syndication FAILED',
      html: `
        <div style="font-family:sans-serif;max-width:520px;">
          <h2 style="color:#dc2626;">Leaflet syndication failed</h2>
          <p>The latest post published to the site, but did not reach Leaflet.pub.</p>
          <p style="background:#fef2f2;padding:12px;border-radius:6px;color:#991b1b;font-family:monospace;font-size:13px;">${errorMessage}</p>
        </div>`,
    })
    log('Failure alert sent')
  } catch (e) {
    log(`Could not send failure alert: ${e.message}`)
  }
}

import { fileURLToPath } from 'node:url'
const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url)
if (!isMain) throw new Error('syndicate-to-leaflet.mjs must be run directly')

main().catch(async err => {
  const msg = err.message || String(err)
  console.error(`[syndicate-leaflet] ERROR: ${msg}`)
  await sendFailureAlert(msg)
  process.exit(1)
})
