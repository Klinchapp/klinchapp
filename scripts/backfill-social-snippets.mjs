/**
 * Klinchapp — Social Snippet Backfill Script
 *
 * Regenerates the `social:` block (and optionally `hook:`) for one or more
 * published posts, via the shared generateSocialSnippets()/generateHookOnly()
 * from blog-pipeline.mjs — the exact same generation used during a normal
 * publish run. Patches each post's frontmatter in place.
 *
 * Why this exists: generateSocialSnippets() has no repair-retry — if the
 * model's JSON response fails to parse even once, it silently falls back to
 * a bare, degenerate template (title + raw topicBrief pasted into 3 of the 6
 * fields, verbatim, no real platform-tailored copy). That happened on the
 * 2026-09-04 publish (best-ai-tools-workplace-2026) — this script is the
 * fix-up tool for when it happens again before the underlying repair-retry
 * gap gets closed.
 *
 * `brief` is sourced from the matching series blueprint's topicBrief field
 * (content/series/<series>.json), matching exactly what the real pipeline
 * passes at scripts/blog-pipeline.mjs:899 — NOT the post's meta description,
 * which is a different field with a different purpose.
 *
 * Usage:
 *   node scripts/backfill-social-snippets.mjs --only=slug1,slug2   # required
 *   node scripts/backfill-social-snippets.mjs --only=slug1 --dry   # print without writing
 *   node scripts/backfill-social-snippets.mjs --only=slug1 --with-hook  # also regenerate hook
 *   node scripts/backfill-social-snippets.mjs --help
 *
 * No blanket "regenerate everything" mode on purpose — this is a targeted
 * fix-up tool for known-broken posts, not a routine backfill across the
 * whole corpus (unlike backfill-hooks.mjs, which upgrades every post
 * deliberately). Always pass --only.
 *
 * Env: requires the same API keys as blog-pipeline.mjs. .env.local is
 * auto-loaded for local runs.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'
import { generateSocialSnippets, generateHookOnly } from './blog-pipeline.mjs'

try { process.loadEnvFile('.env.local') } catch {}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const BLOG_DIR = path.join(ROOT, 'content', 'blog')
const SERIES_DIR = path.join(ROOT, 'content', 'series')

// ─── Args ────────────────────────────────────────────────────

const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  console.log(`Klinchapp Social Snippet Backfill

Usage:
  node scripts/backfill-social-snippets.mjs --only=slug1,slug2
  node scripts/backfill-social-snippets.mjs --only=slug1 --dry
  node scripts/backfill-social-snippets.mjs --only=slug1 --with-hook
`)
  process.exit(0)
}

const isDry = args.includes('--dry')
const withHook = args.includes('--with-hook')
const onlyArg = args.find(a => a.startsWith('--only='))
const onlySlugs = onlyArg ? onlyArg.slice('--only='.length).split(',').map(s => s.trim()).filter(Boolean) : null

if (!onlySlugs || onlySlugs.length === 0) {
  console.error('This tool requires --only=slug1,slug2 — see --help. Not intended as a blanket regenerate-all.')
  process.exit(1)
}

// ─── Helpers ─────────────────────────────────────────────────

const escYaml = (s) => String(s).replace(/"/g, '\\"').replace(/\n/g, '\\n')

function findTopicBrief(series, slug) {
  if (!series) return null
  const filePath = path.join(SERIES_DIR, `${series}.json`)
  if (!fs.existsSync(filePath)) return null
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  const post = data.posts.find(p => p.targetSlug === slug)
  return post ? post.topicBrief : null
}

/**
 * Surgical frontmatter patch: rewrites the `social:` block (all 5 keys) and
 * optionally the `hook:` line, preserving every other line's exact
 * formatting. Avoids re-serialising via gray-matter, which would normalise
 * everything and could reorder/reformat unrelated fields.
 */
function patchFrontmatter(raw, snippets, newHook) {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!fmMatch) throw new Error('No valid frontmatter delimiters found')

  const fmText = fmMatch[1]
  const body = fmMatch[2]

  const socialBlock = [
    'social:',
    `  twitter: "${escYaml(snippets.twitter)}"`,
    `  linkedin: "${escYaml(snippets.linkedin)}"`,
    `  instagram: "${escYaml(snippets.instagram)}"`,
    `  facebook: "${escYaml(snippets.facebook)}"`,
    `  tiktok: "${escYaml(snippets.tiktok)}"`,
  ].join('\n')

  // Match the existing `social:` block through its 5 indented sub-lines.
  const socialBlockRe = /^social:\n(?:  \w+:.*\n?){5}/m
  let newFmText
  if (socialBlockRe.test(fmText)) {
    newFmText = fmText.replace(socialBlockRe, socialBlock + '\n')
  } else {
    throw new Error('Could not find an existing 5-key social: block to replace — patch manually')
  }

  if (newHook) {
    const escapedHook = escYaml(newHook)
    if (/^hook:\s*"[^"]*"\s*$/m.test(newFmText)) {
      newFmText = newFmText.replace(/^hook:\s*"[^"]*"\s*$/m, `hook: "${escapedHook}"`)
    } else if (/^hook:.*$/m.test(newFmText)) {
      newFmText = newFmText.replace(/^hook:.*$/m, `hook: "${escapedHook}"`)
    }
  }

  return `---\n${newFmText}\n---\n${body}`
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  console.log(`Mode: ${isDry ? '[DRY RUN — no writes]' : '[WRITE]'}${withHook ? ', also regenerating hook' : ''}, only=${onlySlugs.join(',')}`)
  console.log('')

  for (const slug of onlySlugs) {
    const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${slug} — no such file: ${filePath}`)
      continue
    }

    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed = matter(raw)
    const title = parsed.data.title
    const series = parsed.data.series

    const brief = findTopicBrief(series, slug)
    if (!brief) {
      console.log(`❌ ${slug} — could not find topicBrief in content/series/${series}.json, skipping`)
      continue
    }

    console.log(`→ ${slug}`)
    console.log(`   title: ${title}`)
    console.log(`   brief (from series blueprint): ${brief.slice(0, 100)}${brief.length > 100 ? '…' : ''}`)

    try {
      const { snippets } = await generateSocialSnippets(title, brief, slug)
      console.log(`   twitter:   ${snippets.twitter}`)
      console.log(`   linkedin:  ${snippets.linkedin.slice(0, 80)}…`)
      console.log(`   instagram: ${snippets.instagram.slice(0, 80)}…`)
      console.log(`   facebook:  ${snippets.facebook.slice(0, 80)}…`)
      console.log(`   tiktok:    ${snippets.tiktok}`)

      let newHook = null
      if (withHook) {
        const content = parsed.content || ''
        const hookResult = await generateHookOnly(title, brief, content)
        newHook = hookResult.hook
        console.log(`   hook:      ${newHook}`)
      }

      if (!isDry) {
        const newRaw = patchFrontmatter(raw, snippets, newHook)
        fs.writeFileSync(filePath, newRaw, 'utf-8')
        console.log(`   ✅ written`)
      } else {
        console.log(`   (dry run — not written)`)
      }
    } catch (err) {
      console.log(`   ❌ failed: ${err.message}`)
    }
    console.log('')
  }
}

main().catch(err => {
  console.error(`Backfill failed: ${err.message}`)
  console.error(err)
  process.exit(1)
})
