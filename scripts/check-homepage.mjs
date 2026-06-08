#!/usr/bin/env node
/**
 * Homepage CI gate. Fetches a URL (preview or prod) and runs a set of
 * structural assertions designed to catch the kinds of regressions that
 * automated builds + Vercel deploy success do NOT catch on their own:
 *
 *   - Logo image disappearing from header/footer
 *   - Staging banner / noindex robots accidentally shipped to production
 *   - Canonical URL pointing at the wrong host
 *   - Malformed or missing JSON-LD structured data
 *
 * Usage:   node scripts/check-homepage.mjs <url>
 * Example: node scripts/check-homepage.mjs https://www.klinchapp.com
 *
 * Exits non-zero on any failed check, with a per-check pass/fail summary.
 */

let url = process.argv[2]
if (!url) {
  console.error('usage: node scripts/check-homepage.mjs <url>')
  process.exit(2)
}

// Trim whitespace — trailing spaces from copy-paste cause redirect loops on Vercel.
url = url.trim()

// Normalize: prepend https:// if no protocol given (matters for workflow_dispatch
// inputs where users often paste bare hostnames).
if (!/^https?:\/\//.test(url)) {
  console.log(`  note: prepending https:// to bare URL`)
  url = `https://${url}`
}

// Validate parseability upfront so we fail with a clean message rather than
// crashing inside undici's URL constructor.
try {
  new URL(url)
} catch {
  console.error(`error: not a valid URL: ${url}`)
  process.exit(2)
}

const checks = []
function check(name, fn) {
  try {
    const detail = fn()
    checks.push({ name, pass: true, detail: detail || '' })
  } catch (err) {
    checks.push({ name, pass: false, detail: err.message })
  }
}

console.log(`fetching ${url} ...`)
const baseHeaders = {}
const bypass = process.env.VERCEL_PROTECTION_BYPASS
if (bypass) {
  baseHeaders['x-vercel-protection-bypass'] = bypass
  // 'samesitenone' tells Vercel's bypass endpoint to set the cookie in the
  // response. We then capture and resend it on the next hop — without this jar,
  // Node fetch drops the cookie and we get stuck in the same Vercel redirect
  // forever.
  baseHeaders['x-vercel-set-bypass-cookie'] = 'samesitenone'
  console.log(`  bypass token present (${bypass.length} chars)`)
} else {
  console.log(`  bypass token NOT SET (env VERCEL_PROTECTION_BYPASS is empty)`)
}

// Manual redirect-following with a cookie jar. Node fetch has no cookie support
// by default, so server-side flows that depend on Set-Cookie (like Vercel's
// Deployment Protection bypass) deadlock on a redirect-to-self until the script
// times out. Capturing Set-Cookie and resending it on the next request breaks
// the loop the way a browser naturally would.
let res
let html
let finalUrl
{
  let currentUrl = url
  const cookies = new Map()
  const maxHops = 10
  for (let hop = 1; hop <= maxHops; hop++) {
    const reqHeaders = { ...baseHeaders }
    if (cookies.size > 0) {
      reqHeaders['cookie'] = [...cookies.entries()]
        .map(([k, v]) => `${k}=${v}`)
        .join('; ')
    }
    res = await fetch(currentUrl, { redirect: 'manual', headers: reqHeaders })

    // Capture any Set-Cookie headers from the response. undici 18+ has
    // getSetCookie(); older fallback uses the raw header (single-cookie only).
    const setCookies = typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : [])
    for (const sc of setCookies) {
      const m = sc.match(/^([^=]+)=([^;]+)/)
      if (m) cookies.set(m[1].trim(), m[2].trim())
    }

    if (res.status < 300 || res.status >= 400) {
      finalUrl = currentUrl
      html = await res.text()
      if (hop > 1) {
        console.log(`  resolved after ${hop} hop(s) — final status=${res.status}, captured ${cookies.size} cookie(s) along the way`)
      }
      break
    }

    // 3xx redirect — log it and continue
    const loc = res.headers.get('location')
    console.log(`  hop ${hop}: ${currentUrl}`)
    console.log(`         → status=${res.status}${loc ? ` location=${loc}` : ' (no location header)'}${setCookies.length ? ` (+${setCookies.length} cookie)` : ''}`)
    if (!loc) {
      finalUrl = currentUrl
      html = await res.text()
      break
    }
    const newUrl = new URL(loc, currentUrl).toString()
    if (newUrl === currentUrl && setCookies.length === 0) {
      console.log(`         → same URL with no new cookies, breaking to avoid infinite loop`)
      finalUrl = currentUrl
      html = await res.text()
      break
    }
    currentUrl = newUrl
  }
  if (!html) {
    console.error(`  exceeded ${maxHops} redirect hops without resolving — Vercel bypass cookie likely not honoured`)
    process.exit(1)
  }
}

check('1. status 200', () => {
  if (res.status !== 200) throw new Error(`got ${res.status}`)
  return `final url: ${finalUrl}`
})

check('2. logo image present (<img src="/logo.jpg">)', () => {
  const matches = html.match(/<img[^>]+src=["']\/logo\.jpg["']/gi) || []
  if (matches.length === 0) throw new Error('no <img src="/logo.jpg"> tag found in rendered HTML')
  return `${matches.length} occurrence(s)`
})

check('3. brand name "Klinchapp" present in header link', () => {
  if (!/Klinchapp/.test(html)) throw new Error('brand name not in HTML')
})

check('4. footer copyright line present', () => {
  if (!/©\s*20\d\d\s*Klinchapp/i.test(html)) throw new Error('no "© 20XX Klinchapp" line found')
})

check('5. canonical points at www.klinchapp.com', () => {
  const m = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)
  if (!m) throw new Error('no <link rel="canonical"> tag')
  const canonical = m[1]
  if (!/^https:\/\/www\.klinchapp\.com\/?$/.test(canonical)) {
    throw new Error(`canonical is "${canonical}" (expected https://www.klinchapp.com)`)
  }
  return canonical
})

check('6. NOT noindex (production must be indexable)', () => {
  const m = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i)
  const content = m ? m[1].toLowerCase() : ''
  if (content.includes('noindex')) throw new Error(`robots meta is "${content}"`)
  return m ? `robots: ${content}` : 'no robots meta (default = index,follow)'
})

check('7. no staging banner text in HTML', () => {
  const stagingMarkers = [/V2 MOCKUP/i, /V3.*Staging/i, /noindex,nofollow/i]
  for (const re of stagingMarkers) {
    if (re.test(html)) throw new Error(`staging marker matched: ${re}`)
  }
})

const ldBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]

check('8. JSON-LD block(s) present', () => {
  if (ldBlocks.length === 0) throw new Error('no <script type="application/ld+json"> blocks found')
  return `${ldBlocks.length} block(s)`
})

const parsedLd = []
check('9. all JSON-LD blocks parse as valid JSON', () => {
  for (let i = 0; i < ldBlocks.length; i++) {
    const raw = ldBlocks[i][1].trim()
    try {
      parsedLd.push(JSON.parse(raw))
    } catch (err) {
      throw new Error(`block ${i + 1} failed to parse: ${err.message}`)
    }
  }
  return `parsed ${parsedLd.length}`
})

function flattenLd(nodes) {
  const out = []
  for (const node of nodes) {
    if (!node) continue
    if (Array.isArray(node)) { out.push(...flattenLd(node)); continue }
    if (node['@graph']) out.push(...flattenLd(node['@graph']))
    out.push(node)
  }
  return out
}

const ldEntities = flattenLd(parsedLd)
const ldTypes = ldEntities.map(e => e['@type']).filter(Boolean)

check('10. JSON-LD contains Organization', () => {
  if (!ldTypes.includes('Organization')) throw new Error(`types found: ${ldTypes.join(', ') || 'none'}`)
})

check('11. JSON-LD contains WebSite', () => {
  if (!ldTypes.includes('WebSite')) throw new Error(`types found: ${ldTypes.join(', ') || 'none'}`)
})

check('12. Organization logo references /logo.jpg', () => {
  const org = ldEntities.find(e => e['@type'] === 'Organization')
  if (!org) throw new Error('no Organization entity')
  const logoUrl = typeof org.logo === 'string' ? org.logo : org.logo?.url
  if (!logoUrl) throw new Error('Organization has no logo')
  if (!/logo\.jpg$/.test(logoUrl)) throw new Error(`logo url is "${logoUrl}"`)
  return logoUrl
})

check('13. Organization url is www.klinchapp.com', () => {
  const org = ldEntities.find(e => e['@type'] === 'Organization')
  if (org?.url !== 'https://www.klinchapp.com') throw new Error(`org.url is "${org?.url}"`)
})

// ============================================================
// summary
// ============================================================
console.log('')
let failed = 0
for (const c of checks) {
  const icon = c.pass ? 'PASS' : 'FAIL'
  console.log(`  [${icon}] ${c.name}${c.detail ? `  — ${c.detail}` : ''}`)
  if (!c.pass) failed++
}
console.log('')
if (failed > 0) {
  console.log(`${failed}/${checks.length} checks failed against ${url}`)
  process.exit(1)
}
console.log(`all ${checks.length} checks passed against ${url}`)
