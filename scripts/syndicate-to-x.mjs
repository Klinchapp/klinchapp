#!/usr/bin/env node
/**
 * Syndicates the latest published Klinchapp blog post to X (@KlinchappAI).
 *
 * Post format:
 *   <meta description>
 *
 *   klinchapp.com/blog/<slug>
 *
 * X generates link preview automatically from the URL — no image upload needed.
 * Dedup: checks recent tweets for the URL before posting — never double-posts.
 *
 * Env vars required:
 *   X_API_KEY             — Consumer Key
 *   X_API_SECRET          — Consumer Secret
 *   X_ACCESS_TOKEN        — Access Token (for @KlinchappAI)
 *   X_ACCESS_TOKEN_SECRET — Access Token Secret
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import matter from 'gray-matter'

try { process.loadEnvFile('.env.local') } catch {}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')
const SITE_URL = 'https://www.klinchapp.com'
const X_API_BASE = 'https://api.twitter.com'

function log(msg) { console.log(`[syndicate-x] ${msg}`) }
function fail(msg) { throw new Error(msg) }

// ─── OAuth 1.0a helpers ───────────────────────────────────────────────────────

function pctEncode(str) {
  return encodeURIComponent(String(str))
    .replace(/!/g, '%21').replace(/'/g, '%27')
    .replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A')
}

function buildAuthHeader(method, url, consumerKey, consumerSecret, accessToken, accessTokenSecret) {
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
  }

  // Signature base string — only OAuth params (JSON body excluded from v2 signature)
  const paramString = Object.entries(oauthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${pctEncode(k)}=${pctEncode(v)}`)
    .join('&')

  const baseString = [method.toUpperCase(), pctEncode(url), pctEncode(paramString)].join('&')
  const signingKey = `${pctEncode(consumerSecret)}&${pctEncode(accessTokenSecret)}`
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64')

  const headerParts = { ...oauthParams, oauth_signature: signature }
  const header = Object.entries(headerParts)
    .map(([k, v]) => `${pctEncode(k)}="${pctEncode(v)}"`)
    .join(', ')

  return `OAuth ${header}`
}

function xFetch(endpoint, method, body, creds) {
  const url = `${X_API_BASE}${endpoint}`
  const auth = buildAuthHeader(method, url, creds.apiKey, creds.apiSecret, creds.accessToken, creds.accessSecret)
  return fetch(url, {
    method,
    headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
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

function buildPostText(description, canonicalUrl) {
  // X counts URLs as 23 chars regardless of length (t.co shortening)
  const urlPart = `\n\n${canonicalUrl}`
  const maxDesc = 280 - 23 - 2 // 2 for \n\n
  const truncated = description.length > maxDesc
    ? description.slice(0, maxDesc - 1) + '…'
    : description
  return truncated + urlPart
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET } = process.env
  if (!X_API_KEY || !X_API_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_TOKEN_SECRET) {
    fail('Missing X credentials — need X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET')
  }

  const creds = {
    apiKey: X_API_KEY,
    apiSecret: X_API_SECRET,
    accessToken: X_ACCESS_TOKEN,
    accessSecret: X_ACCESS_TOKEN_SECRET,
  }

  const post = getLatestPublishedPost()
  if (!post) fail('No published posts found')

  const { data } = post
  const slug = data.slug
  const canonicalUrl = `${SITE_URL}/blog/${slug}`
  log(`Latest post: ${slug}`)

  // Dedup — check recent tweets for this URL
  log('Checking for existing tweet...')
  try {
    const res = await xFetch('/2/users/me?tweet.fields=text&expansions=pinned_tweet_id', 'GET', null, creds)
    const me = await res.json()
    const userId = me?.data?.id

    if (userId) {
      const tweetsRes = await xFetch(
        `/2/users/${userId}/tweets?max_results=20&tweet.fields=text`,
        'GET', null, creds
      )
      const tweets = await tweetsRes.json()
      const alreadyPosted = (tweets?.data || []).some(t => t.text.includes(slug))
      if (alreadyPosted) {
        log(`Already posted — skipping`)
        return
      }
    }
  } catch (e) {
    log(`Dedup check skipped: ${e.message}`)
  }

  const text = buildPostText(data.description || data.title, canonicalUrl)
  log(`Posting (${text.length} chars):\n${text}`)

  const res = await xFetch('/2/tweets', 'POST', { text }, creds)
  const result = await res.json()

  if (!res.ok) {
    const msg = result?.detail || result?.errors?.[0]?.message || JSON.stringify(result)
    if (res.status === 403) fail(`403 Forbidden — check app permissions are set to Read+Write and regenerate Access Token: ${msg}`)
    fail(`POST /2/tweets failed: ${res.status} ${msg}`)
  }

  log(`Posted: https://x.com/KlinchappAi/status/${result.data.id}`)
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
      subject: '❌ X syndication FAILED',
      html: `
        <div style="font-family:sans-serif;max-width:520px;">
          <h2 style="color:#dc2626;">X syndication failed</h2>
          <p>The latest post published to the site, but did not reach X (@KlinchappAI).</p>
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
  console.error(`[syndicate-x] ERROR: ${msg}`)
  await sendFailureAlert(msg)
  process.exit(1)
})
