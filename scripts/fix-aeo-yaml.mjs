/**
 * One-shot repair for the AEO backfill description-patch bug.
 *
 * The patchDescription regex in backfill-aeo.mjs replaced the first line of
 * `description:` (including `>-` block-scalar headers) but left behind the
 * indented continuation lines of any multi-line description.  This produces
 * invalid YAML that gray-matter throws on.
 *
 * Fix: for each MDX file, find the frontmatter block, locate the description
 * field, and remove any indented continuation lines that follow the (already
 * corrected) single-line value.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const BLOG_DIR = path.join(ROOT, 'content', 'blog')

const isMainModule = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url)
if (!isMainModule) throw new Error('run directly')

let fixed = 0
let ok = 0
let errors = 0

for (const file of fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'))) {
  const filePath = path.join(BLOG_DIR, file)
  const raw = fs.readFileSync(filePath, 'utf-8')

  // Quick parse attempt — skip files that already parse fine
  try {
    matter(raw)
    ok++
    continue
  } catch (e) {
    // YAML error — needs repair
  }

  // Find frontmatter block (between first and second ---)
  const fmEnd = raw.indexOf('---', 3)
  if (fmEnd === -1) {
    console.error(`  ❌ ${file} — can't find frontmatter end`)
    errors++
    continue
  }

  const fmRaw = raw.slice(0, fmEnd + 3)
  const body = raw.slice(fmEnd + 3)

  // Remove indented continuation lines that appear after a description: "..." line
  // Pattern: description: "..." followed by lines starting with whitespace,
  // up to (but not including) the next non-indented YAML key.
  const repairedFm = fmRaw.replace(
    /(^description:\s*"[^"]*"\n)((?:[ \t]+[^\n]*\n)*)/m,
    '$1'
  )

  // Verify repair worked
  try {
    matter(repairedFm + body)
    fs.writeFileSync(filePath, repairedFm + body)
    console.log(`  ✅ fixed: ${file}`)
    fixed++
  } catch (e2) {
    console.error(`  ❌ ${file} — repair failed: ${e2.message}`)
    errors++
  }
}

console.log(`\nDone — fixed: ${fixed} | already-ok: ${ok} | errors: ${errors}`)
