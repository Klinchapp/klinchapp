/**
 * Klinchapp — Hook Backfill Script
 *
 * Walks every published MDX in content/blog/, generates a humor-biased hook
 * via the shared HOOK_PROMPT_SECTION + generateHookOnly from blog-pipeline.mjs,
 * and patches each post's frontmatter in place.
 *
 * Why this exists: the carousel cards on /blog use the `hook` field as their
 * lead text. Most existing posts don't have one yet; the ones that do were
 * generated under an older softer spec. This script upgrades both at once.
 *
 * Spec: scripts/HOOK_PROMPT_GUIDE.md
 *
 * Usage:
 *   node scripts/backfill-hooks.mjs                 # only-missing (safe default)
 *   node scripts/backfill-hooks.mjs --regenerate-all # overwrite every post's hook
 *   node scripts/backfill-hooks.mjs --dry           # print without writing
 *   node scripts/backfill-hooks.mjs --only=slug1,slug2  # target specific posts
 *   node scripts/backfill-hooks.mjs --help
 *
 * Combine flags freely. --dry + --regenerate-all is recommended for the first run
 * so you can eyeball every hook before committing the change.
 *
 * Env: requires the same API keys as blog-pipeline.mjs (ANTHROPIC_API_KEY at
 * minimum for the Claude Haiku primary path). .env.local is auto-loaded.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'
import { HOOK_PROMPT_SECTION, generateHookOnly } from './blog-pipeline.mjs'

// Load .env.local for local runs (same pattern as the syndication scripts).
try { process.loadEnvFile('.env.local') } catch {}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const BLOG_DIR = path.join(ROOT, 'content', 'blog')

// ─── Args ────────────────────────────────────────────────────

const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  console.log(`Klinchapp Hook Backfill — see scripts/HOOK_PROMPT_GUIDE.md for the spec.

Usage:
  node scripts/backfill-hooks.mjs                       # only-missing, Haiku
  node scripts/backfill-hooks.mjs --regenerate-all
  node scripts/backfill-hooks.mjs --dry
  node scripts/backfill-hooks.mjs --only=slug1,slug2
  node scripts/backfill-hooks.mjs --model=sonnet        # Sonnet for sharper editorial output
                                                        #   (haiku is default, cheap & fast)
`)
  process.exit(0)
}

const isDry = args.includes('--dry')
const regenerateAll = args.includes('--regenerate-all')
const onlyArg = args.find(a => a.startsWith('--only='))
const onlySlugs = onlyArg ? onlyArg.slice('--only='.length).split(',').map(s => s.trim()).filter(Boolean) : null
const modelArg = args.find(a => a.startsWith('--model='))
const modelChoice = modelArg ? modelArg.slice('--model='.length).trim() : 'haiku'
const PROVIDER_BY_MODEL = { haiku: 'claude-haiku', sonnet: 'claude-sonnet' }
const preferredProviderName = PROVIDER_BY_MODEL[modelChoice]
if (!preferredProviderName) {
  console.error(`Unknown --model value: "${modelChoice}". Use haiku or sonnet.`)
  process.exit(1)
}

// ─── Helpers ─────────────────────────────────────────────────

// Same escape pattern as blog-pipeline.mjs:625 — keep behaviour identical.
const escYaml = (s) => s.replace(/"/g, '\\"').replace(/\n/g, '\\n')

/**
 * Surgical frontmatter patch: rewrites or inserts only the `hook:` line.
 * Preserves every other line's exact formatting (whitespace, ordering, quoting).
 * Avoids re-serialising via gray-matter, which would normalise everything.
 */
function patchHookInRaw(raw, newHook) {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!fmMatch) throw new Error('No valid frontmatter delimiters found')

  const fmText = fmMatch[1]
  const body = fmMatch[2]
  const escaped = escYaml(newHook)

  let newFmText
  if (/^hook:\s*"[^"]*"\s*$/m.test(fmText)) {
    newFmText = fmText.replace(/^hook:\s*"[^"]*"\s*$/m, `hook: "${escaped}"`)
  } else if (/^hook:.*$/m.test(fmText)) {
    // Hook present but in a different shape (no quotes, or multi-line) — replace the whole line.
    newFmText = fmText.replace(/^hook:.*$/m, `hook: "${escaped}"`)
  } else {
    // Insert after `author:` if present, else after `tags:`, else at end of frontmatter.
    if (/^author:.*$/m.test(fmText)) {
      newFmText = fmText.replace(/(^author:.*$)/m, `$1\nhook: "${escaped}"`)
    } else if (/^tags:.*$/m.test(fmText)) {
      newFmText = fmText.replace(/(^tags:.*$)/m, `$1\nhook: "${escaped}"`)
    } else {
      newFmText = `${fmText}\nhook: "${escaped}"`
    }
  }

  return `---\n${newFmText}\n---\n${body}`
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error(`Blog directory not found: ${BLOG_DIR}`)
    process.exit(1)
  }

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'))
  console.log(`Found ${files.length} MDX files in ${path.relative(ROOT, BLOG_DIR)}`)
  console.log(`Mode: ${isDry ? '[DRY RUN — no writes]' : '[WRITE]'}, ${regenerateAll ? 'regenerate-all' : 'only-missing'}, model=${modelChoice}${onlySlugs ? `, only=${onlySlugs.join(',')}` : ''}`)
  console.log('')

  const stats = { processed: 0, skipped: 0, generated: 0, failed: 0 }

  for (const filename of files) {
    const filePath = path.join(BLOG_DIR, filename)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed = matter(raw)
    const slug = parsed.data.slug || path.basename(filename, '.mdx')

    if (onlySlugs && !onlySlugs.includes(slug)) {
      stats.skipped++
      continue
    }

    if (parsed.data.status !== 'published') {
      console.log(`⏭  ${slug} — status="${parsed.data.status || 'unset'}", skipping`)
      stats.skipped++
      continue
    }

    if (parsed.data.hook && !regenerateAll) {
      console.log(`✓  ${slug} — hook already present, skipping (use --regenerate-all to overwrite)`)
      stats.skipped++
      continue
    }

    stats.processed++

    const title = parsed.data.title || slug
    const brief = parsed.data.description || ''
    const content = parsed.content || ''

    console.log(`\n→ ${slug}`)
    console.log(`   title: ${title}`)
    console.log(`   brief: ${brief.slice(0, 100)}${brief.length > 100 ? '…' : ''}`)
    console.log(`   content: ${content.length} chars (passing first ${Math.min(2000, content.length)} to LLM)`)
    if (parsed.data.hook) {
      console.log(`   existing hook: ${parsed.data.hook}`)
    }

    try {
      const { hook } = await generateHookOnly(title, brief, content, { preferredProviderName })
      console.log(`   NEW hook (${hook.length} chars): ${hook}`)
      stats.generated++

      if (!isDry) {
        const newRaw = patchHookInRaw(raw, hook)
        fs.writeFileSync(filePath, newRaw, 'utf-8')
        console.log(`   ✅ written`)
      } else {
        console.log(`   (dry run — not written)`)
      }
    } catch (err) {
      console.log(`   ❌ failed: ${err.message}`)
      stats.failed++
    }
  }

  console.log('')
  console.log('─'.repeat(50))
  console.log(`Processed: ${stats.processed} | Generated: ${stats.generated} | Skipped: ${stats.skipped} | Failed: ${stats.failed}`)
  if (isDry) console.log('DRY RUN — no files were modified.')
}

main().catch(err => {
  console.error(`Backfill failed: ${err.message}`)
  console.error(err)
  process.exit(1)
})
