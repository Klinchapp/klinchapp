/**
 * Klinchapp — AEO Backfill Script
 *
 * Applies three AEO improvements to every published blog post:
 *   1. Answer-first paragraph (40-60 words, direct answer to the title question)
 *   2. FAQ block (3-5 Q&A pairs, 40-80 word answers) — eligible formats only
 *   3. Updated meta description (120-155 chars, keyword-first, Kira's voice)
 *
 * Format eligibility:
 *   - how-to-guide, opinion → answer-first + meta only (no FAQ)
 *   - deep-analysis, tool-review, research-breakdown, roundup → all three
 *   - Posts that already have 3+ ### Question? blocks → FAQ step skipped
 *
 * Usage:
 *   node scripts/backfill-aeo.mjs --dry              # preview without writing
 *   node scripts/backfill-aeo.mjs                    # process all posts
 *   node scripts/backfill-aeo.mjs --only=slug1,slug2 # target specific posts
 *   node scripts/backfill-aeo.mjs --model=sonnet     # use Sonnet (default: haiku)
 *
 * Combine freely. --dry is strongly recommended before the first real run.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'
import { callWithFailover } from './blog-pipeline.mjs'

try { process.loadEnvFile('.env.local') } catch {}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const BLOG_DIR = path.join(ROOT, 'content', 'blog')
const SERIES_DIR = path.join(ROOT, 'content', 'series')

// ─── Args ────────────────────────────────────────────────────

const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  console.log(`Klinchapp AEO Backfill

Usage:
  node scripts/backfill-aeo.mjs                       # all posts
  node scripts/backfill-aeo.mjs --dry                 # preview without writing
  node scripts/backfill-aeo.mjs --only=slug1,slug2    # specific posts
  node scripts/backfill-aeo.mjs --model=sonnet        # Sonnet for sharper output
`)
  process.exit(0)
}

const isDry = args.includes('--dry')
const modelOverride = args.find(a => a.startsWith('--model='))?.split('=')[1] || 'haiku'
const preferredProviderName = modelOverride === 'sonnet' ? 'claude-sonnet' : 'claude-haiku'
const onlyArg = args.find(a => a.startsWith('--only='))
const onlySlugs = onlyArg ? onlyArg.split('=')[1].split(',') : null

// ─── Format Map (from series blueprints) ─────────────────────

function buildFormatMap() {
  const map = {}
  if (!fs.existsSync(SERIES_DIR)) return map
  for (const file of fs.readdirSync(SERIES_DIR).filter(f => f.endsWith('.json'))) {
    const series = JSON.parse(fs.readFileSync(path.join(SERIES_DIR, file), 'utf-8'))
    for (const post of series.posts) {
      if (post.targetSlug && post.format) {
        map[post.targetSlug] = post.format
      }
    }
  }
  return map
}

// ─── FAQ Detection ───────────────────────────────────────────

function hasExistingFAQ(content) {
  const lines = content.split('\n')
  let count = 0
  for (const line of lines) {
    if (/^###\s+.+\?\s*$/.test(line)) count++
  }
  return count >= 3
}

// ─── Insertion Helpers ───────────────────────────────────────

// Insert the answer-first paragraph right after the first H1 (if present),
// or at the very start of body content. Replaces the existing opening paragraph
// if it doesn't read as a declarative direct answer (we always regenerate it).
function insertAnswerFirst(content, paragraph) {
  const lines = content.split('\n')
  // Find H1
  const h1Index = lines.findIndex(l => /^#\s+/.test(l))
  if (h1Index !== -1) {
    // Insert after H1, with blank line separation
    lines.splice(h1Index + 1, 0, '', paragraph, '')
    // Remove any duplicate blank lines
    return lines.join('\n').replace(/\n{3,}/g, '\n\n')
  }
  // No H1 — prepend
  return paragraph + '\n\n' + content
}

// Insert FAQ block just before ## References, or before ## Tags / at end
function insertFAQ(content, faqBlock) {
  // Try to find ## References
  const refMatch = content.match(/\n(## References[\s\S]*)$/)
  if (refMatch) {
    const idx = content.lastIndexOf(refMatch[0])
    return content.slice(0, idx) + '\n\n' + faqBlock + '\n' + content.slice(idx)
  }
  // Append at end
  return content.trimEnd() + '\n\n' + faqBlock + '\n'
}

// ─── LLM Generators ─────────────────────────────────────────

const KIRA_SYSTEM = `You are Kira, an AI content specialist writing for the Klinchapp blog. Your voice is:
- Clear, direct, and conversational — never academic or hedging
- First person ("I") addressing the reader as "you"
- Optimistic about AI but honest about limitations
- You write in short, punchy sentences. No filler.`

async function generateAnswerFirst(title, keyword, contentExcerpt, options) {
  const prompt = `Write an answer-first paragraph for this blog post.

Title: "${title}"
Target keyword: "${keyword || ''}"
Post opening (first 600 words for context):
${contentExcerpt}

RULES:
- Exactly 40-60 words. Count carefully.
- Directly answers the question implied by the title — be definitive, not a teaser
- Complete and self-contained: a reader should get the core answer from this paragraph alone without clicking through
- Kira's voice: first person, conversational, no hedging words ("might", "could", "perhaps")
- No filler phrases ("In today's rapidly evolving...", "In this post I'll...")
- Do NOT repeat the title verbatim
- Write in plain prose — NO bold, NO lists, NO headings
- Return ONLY the paragraph text, nothing else`

  const result = await callWithFailover(KIRA_SYSTEM, prompt, 200, { preferredProviderName: options.preferredProviderName })
  return result.text.trim()
}

async function generateFAQ(title, keyword, contentExcerpt, format, options) {
  const prompt = `Write a FAQ block for this blog post.

Title: "${title}"
Format: ${format}
Target keyword: "${keyword || ''}"
Post content (first 1500 words for context):
${contentExcerpt}

RULES:
- Write exactly 4 FAQ entries (5 if the topic naturally supports it)
- Each question: a real question a reader would type into ChatGPT or Google, ending with "?"
- Phrase questions as ### headings (e.g. "### Does AI really work for small businesses?")
- Each answer: 40-80 words. COMPLETE and self-contained — answerable without reading the post
- Answers must be grounded in the post content — do NOT invent facts or stats not in the post
- Kira's voice: direct, first person where natural, conversational
- Cover different angles — don't ask variations of the same question
- The section should start with: ## Frequently asked questions
- Return ONLY the FAQ section (## heading + ### Q+A pairs), nothing else

EXAMPLE FORMAT:
## Frequently asked questions

### What is [topic]?
[40-80 word direct answer]

### How does [x] work?
[40-80 word direct answer]`

  const result = await callWithFailover(KIRA_SYSTEM, prompt, 800, { preferredProviderName: options.preferredProviderName })
  return result.text.trim()
}

async function generateMetaDescription(title, keyword, contentExcerpt, options) {
  const prompt = `Write a meta description for this blog post.

Title: "${title}"
Target keyword: "${keyword || ''}"
Post opening: ${contentExcerpt.slice(0, 400)}

RULES:
- Exactly 120-155 characters. Count every character including spaces.
- Include the target keyword naturally near the start
- Compelling — this is what appears in Google and AI search results
- Kira's voice: direct, no "In this post" or "This article" openers
- End with a value hook — what does the reader get?
- Do NOT use quotes or labels in your response
- Return ONLY the meta description text, nothing else`

  const result = await callWithFailover(
    'You write SEO meta descriptions. Return only the description text — no quotes, no labels.',
    prompt,
    100,
    { preferredProviderName: options.preferredProviderName }
  )
  let desc = result.text.trim().replace(/^["']|["']$/g, '').replace(/^meta description:\s*/i, '')
  if (desc.length > 160) desc = desc.slice(0, 157) + '...'
  return desc
}

// ─── Raw frontmatter description patcher ─────────────────────
// Updates only the `description:` line in the raw MDX string without
// reformatting the entire YAML block (matter.stringify() changes quote
// styles and encodes emojis as \U escapes — unacceptable for live posts).
function patchDescription(raw, newDesc) {
  // Find the frontmatter end so we only operate on that block
  const fmEnd = raw.indexOf('---', 3) + 3
  const fm = raw.slice(0, fmEnd)
  const body = raw.slice(fmEnd)

  // Replace the description field including any multi-line continuation lines
  // (>- block scalars, | literals, or plain indented continuations).
  // Matches: "description: <anything>" + optional following lines that start with whitespace
  const patched = fm.replace(
    /^(description:\s*)(?:"[^"]*"|'[^']*'|>-?[ \t]*|[^\n]*)\n((?:[ \t]+[^\n]*\n)*)/m,
    `$1"${newDesc.replace(/"/g, '\\"')}"\n`
  )
  return patched + body
}

// ─── Main ────────────────────────────────────────────────────
// Guard: only run when invoked directly (not when imported as a module).
const isMainModule = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url)
if (!isMainModule) throw new Error('backfill-aeo.mjs must be run directly: node scripts/backfill-aeo.mjs')

const formatMap = buildFormatMap()

// Formats that do NOT get FAQ blocks
const NO_FAQ_FORMATS = new Set(['how-to-guide', 'opinion'])

const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'))
const options = { preferredProviderName }

let processed = 0
let skipped = 0
let errors = 0

console.log(`\n${'═'.repeat(50)}`)
console.log(`  AEO BACKFILL${isDry ? ' (DRY RUN)' : ''}  —  model: ${modelOverride}`)
console.log(`${'═'.repeat(50)}\n`)

for (const file of files) {
  const slug = file.replace('.mdx', '')
  if (onlySlugs && !onlySlugs.includes(slug)) continue

  const filePath = path.join(BLOG_DIR, file)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data: frontmatter, content } = matter(raw)

  // Only process published posts
  if (frontmatter.status !== 'published') {
    console.log(`  ⏭ ${slug} — skipped (status: ${frontmatter.status})`)
    skipped++
    continue
  }

  const format = formatMap[slug] || 'deep-analysis'
  const faqEligible = !NO_FAQ_FORMATS.has(format)
  const alreadyHasFAQ = hasExistingFAQ(content)
  const keyword = frontmatter.targetKeyword || ''
  const contentExcerpt = content.slice(0, 2000)

  console.log(`\n📄 ${slug}`)
  console.log(`   format: ${format} | faq-eligible: ${faqEligible} | has-faq: ${alreadyHasFAQ}`)

  try {
    // 1. Answer-first paragraph
    console.log(`   → generating answer-first paragraph...`)
    const answerFirst = await generateAnswerFirst(frontmatter.title, keyword, contentExcerpt, options)
    console.log(`   ✅ answer-first (${answerFirst.split(/\s+/).length} words): ${answerFirst.slice(0, 80)}...`)

    // 2. FAQ block (if eligible and not already present)
    let faqBlock = null
    if (faqEligible && !alreadyHasFAQ) {
      console.log(`   → generating FAQ block...`)
      faqBlock = await generateFAQ(frontmatter.title, keyword, content.slice(0, 3000), format, options)
      const qCount = (faqBlock.match(/^### /gm) || []).length
      console.log(`   ✅ FAQ block (${qCount} questions)`)
    } else if (alreadyHasFAQ) {
      console.log(`   ℹ️  FAQ already present — skipping`)
    } else {
      console.log(`   ℹ️  Format "${format}" — FAQ not applicable`)
    }

    // 3. Meta description
    console.log(`   → generating meta description...`)
    const metaDesc = await generateMetaDescription(frontmatter.title, keyword, contentExcerpt, options)
    console.log(`   ✅ meta (${metaDesc.length} chars): ${metaDesc}`)

    if (isDry) {
      console.log(`\n   [DRY] Answer-first paragraph:\n   ${answerFirst}`)
      if (faqBlock) console.log(`\n   [DRY] FAQ block (first 300 chars):\n   ${faqBlock.slice(0, 300)}...`)
      console.log(`\n   [DRY] Meta description:\n   ${metaDesc}`)
    } else {
      // Apply answer-first to content
      let updatedContent = insertAnswerFirst(content, answerFirst)

      // Apply FAQ block
      if (faqBlock) {
        updatedContent = insertFAQ(updatedContent, faqBlock)
      }

      // Reconstruct raw MDX: preserve original frontmatter format, only patch description.
      // We do NOT use matter.stringify() — it reformats the entire YAML block, changes
      // quote styles, and encodes emojis as Unicode escapes. Instead we:
      //   1. Rebuild from original frontmatter + updated content (to apply answer-first / FAQ)
      //   2. Surgically replace only the description field in the frontmatter string
      const frontmatterEndIdx = raw.indexOf('---', 3) + 3
      const originalFrontmatter = raw.slice(0, frontmatterEndIdx)
      const patchedFrontmatter = patchDescription(originalFrontmatter, metaDesc)
      const updatedRaw = patchedFrontmatter + '\n\n' + updatedContent.trimStart()
      fs.writeFileSync(filePath, updatedRaw)
      console.log(`   💾 written`)
    }

    processed++
  } catch (err) {
    console.error(`   ❌ error: ${err.message}`)
    errors++
  }
}

console.log(`\n${'═'.repeat(50)}`)
console.log(`  DONE — processed: ${processed} | skipped: ${skipped} | errors: ${errors}`)
if (isDry) console.log(`  DRY RUN — no files written`)
console.log(`${'═'.repeat(50)}\n`)
