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
const headers = {}
const bypass = process.env.VERCEL_PROTECTION_BYPASS
if (bypass) {
  headers['x-vercel-protection-bypass'] = bypass
  // 'samesitenone' is required for server-side fetches that follow redirects —
  // 'true' produces a SameSite=Lax cookie which can be dropped on the redirect
  // chain in non-browser contexts.
  headers['x-vercel-set-bypass-cookie'] = 'samesitenone'
  console.log(`  bypass token present (${bypass.length} chars)`)
} else {
  console.log(`  bypass token NOT SET (env VERCEL_PROTECTION_BYPASS is empty)`)
}

let res
try {
  res = await fetch(url, { redirect: 'follow', headers })
} catch (err) {
  // Replay with redirect:'manual' so the redirect chain is visible.
  console.log(`\nfetch failed: ${err.message}`)
  if (err.cause) console.log(`cause: ${err.cause.message}`)
  console.log(`\nDIAGNOSTIC: replaying with redirect:'manual' to show the chain...`)
  let currentUrl = url
  for (let hop = 1; hop <= 10; hop++) {
    const r = await fetch(currentUrl, { redirect: 'manual', headers })
    const loc = r.headers.get('location')
    console.log(`  hop ${hop}: ${currentUrl}`)
    console.log(`         → status=${r.status} ${loc ? `location=${loc}` : '(no redirect)'}`)
    if (r.status < 300 || r.status >= 400) {
      const body = await r.text()
      console.log(`         body excerpt: ${body.slice(0, 200).replace(/\s+/g, ' ')}`)
      break
    }
    if (!loc) break
    currentUrl = new URL(loc, currentUrl).toString()
  }
  process.exit(1)
}
const html = await res.text()
const finalUrl = res.url

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
