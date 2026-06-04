/**
 * Klinchapp — Platform Internal Links Backfill
 *
 * Walks every published MDX in content/blog/, runs addPlatformLinks() on the
 * body, and writes back. Idempotent — re-running won't double-link because
 * addPlatformLinks() skips text already inside markdown links.
 *
 * Spec: scripts/PLATFORM_LINKS_GUIDE.md
 *
 * Usage:
 *   node scripts/backfill-platform-links.mjs              # write changes
 *   node scripts/backfill-platform-links.mjs --dry        # print diffs, don't write
 *   node scripts/backfill-platform-links.mjs --only=slug1,slug2
 *   node scripts/backfill-platform-links.mjs --help
 *
 * No LLM, no API keys needed — pure rule-based post-processing.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'
import { addPlatformLinks, PLATFORM_LINKS } from './blog-pipeline.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const BLOG_DIR = path.join(ROOT, 'content', 'blog')

const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  console.log(`Klinchapp Platform Links Backfill — see scripts/PLATFORM_LINKS_GUIDE.md for the spec.

Usage:
  node scripts/backfill-platform-links.mjs              # write changes
  node scripts/backfill-platform-links.mjs --dry        # print diffs, don't write
  node scripts/backfill-platform-links.mjs --only=slug1,slug2
`)
  process.exit(0)
}

const isDry = args.includes('--dry')
const onlyArg = args.find(a => a.startsWith('--only='))
const onlySlugs = onlyArg ? onlyArg.slice('--only='.length).split(',').map(s => s.trim()).filter(Boolean) : null

function diffLines(before, after) {
  // Per-line side-by-side — only show lines that actually changed
  const beforeLines = before.split('\n')
  const afterLines = after.split('\n')
  const out = []
  for (let i = 0; i < Math.max(beforeLines.length, afterLines.length); i++) {
    if (beforeLines[i] !== afterLines[i]) {
      out.push(`  -  ${beforeLines[i] ?? ''}`)
      out.push(`  +  ${afterLines[i] ?? ''}`)
    }
  }
  return out.join('\n')
}

function countLinksAdded(before, after) {
  let count = 0
  for (const { url } of PLATFORM_LINKS) {
    const beforeMatches = (before.match(new RegExp(`\\(${url.replace(/\//g, '\\/')}\\)`, 'g')) || []).length
    const afterMatches = (after.match(new RegExp(`\\(${url.replace(/\//g, '\\/')}\\)`, 'g')) || []).length
    count += afterMatches - beforeMatches
  }
  return count
}

async function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error(`Blog directory not found: ${BLOG_DIR}`)
    process.exit(1)
  }

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'))
  console.log(`Found ${files.length} MDX files in ${path.relative(ROOT, BLOG_DIR)}`)
  console.log(`Mode: ${isDry ? '[DRY RUN — no writes]' : '[WRITE]'}${onlySlugs ? `, only=${onlySlugs.join(',')}` : ''}`)
  console.log('')

  const stats = { processed: 0, changed: 0, unchanged: 0, totalLinksAdded: 0 }

  for (const filename of files) {
    const filePath = path.join(BLOG_DIR, filename)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed = matter(raw)
    const slug = parsed.data.slug || path.basename(filename, '.mdx')

    if (onlySlugs && !onlySlugs.includes(slug)) continue
    if (parsed.data.status !== 'published') {
      console.log(`⏭  ${slug} — status="${parsed.data.status || 'unset'}", skipping`)
      continue
    }

    stats.processed++
    const before = parsed.content
    const after = addPlatformLinks(before)

    if (before === after) {
      stats.unchanged++
      console.log(`✓  ${slug} — no platform mentions to link (already linked or none found)`)
      continue
    }

    const linksAdded = countLinksAdded(before, after)
    stats.changed++
    stats.totalLinksAdded += linksAdded

    console.log(`\n→ ${slug} (${linksAdded} link${linksAdded === 1 ? '' : 's'} added)`)
    console.log(diffLines(before, after))

    if (!isDry) {
      // Reassemble: same frontmatter, new content
      const fmMatch = raw.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)([\s\S]*)$/)
      if (!fmMatch) {
        console.log(`   ❌ Could not parse frontmatter — skipping write`)
        continue
      }
      const newRaw = fmMatch[1] + after
      fs.writeFileSync(filePath, newRaw, 'utf-8')
      console.log(`   ✅ written`)
    } else {
      console.log(`   (dry run — not written)`)
    }
  }

  console.log('')
  console.log('─'.repeat(50))
  console.log(`Processed: ${stats.processed} | Changed: ${stats.changed} | Unchanged: ${stats.unchanged} | Total links added: ${stats.totalLinksAdded}`)
  if (isDry) console.log('DRY RUN — no files were modified.')
}

main().catch(err => {
  console.error(`Backfill failed: ${err.message}`)
  console.error(err)
  process.exit(1)
})
