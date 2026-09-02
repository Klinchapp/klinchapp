/**
 * Klinchapp Blog Series Planner
 *
 * Runs monthly to auto-generate new series blueprints.
 * Researches current AI trends, reviews existing content,
 * and creates up to 3 new series with 6-8 topics each.
 *
 * Each series is generated in its own API call (not batched into one big
 * JSON array) so a single response can't grow large enough to get cut off
 * by the token limit, and one failed series can't take the other two down
 * with it (see 2026-09-01 incident: a batched 2-3 series request got
 * truncated mid-JSON and the whole run aborted before any series saved and
 * before the "queue is empty" digest email could send).
 *
 * Usage:
 *   node scripts/blog-planner.mjs
 *
 * Cron: 1st of every month at 9am UTC
 */

import fs from 'fs'
import path from 'path'
import { formatDefinitionsForPrompt } from './blog-format-definitions.mjs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SERIES_DIR = path.join(ROOT, 'content', 'series')

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`)
}

function getExistingContent() {
  if (!fs.existsSync(SERIES_DIR)) return { series: [], topics: [] }

  const files = fs.readdirSync(SERIES_DIR).filter(f => f.endsWith('.json'))
  const series = []
  const topics = []

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(SERIES_DIR, file), 'utf-8'))
    series.push({ slug: data.slug, title: data.title, totalPosts: data.totalPosts })
    for (const post of data.posts) {
      topics.push(post.topicTitle)
    }
  }

  return { series, topics }
}

function getPendingCount() {
  if (!fs.existsSync(SERIES_DIR)) return 0

  const files = fs.readdirSync(SERIES_DIR).filter(f => f.endsWith('.json'))
  let pending = 0

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(SERIES_DIR, file), 'utf-8'))
    pending += data.posts.filter(p => p.status === 'pending').length
  }

  return pending
}

async function researchTrends() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY')

  log('🌐 Step 1: Researching current AI trends...')

  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
    messages: [{
      role: 'user',
      content: `Research the most talked about AI topics and trends right now. I need to plan blog content for the next 2-3 months.

Find:
1. The top 5-7 AI topics getting the most attention in news, social media, and industry right now
2. Emerging AI applications or tools that people are searching for
3. AI controversies or debates currently happening
4. AI topics that would interest small business owners, creators, and general audiences (not just developers)
5. Any upcoming AI events, product launches, or regulatory changes

Focus on topics that would make good blog series (4-8 posts each), not one-off news items. I want evergreen-ish topics with a current hook.

Return a structured summary with topic areas and why they're trending.`
    }],
  })

  const textBlocks = response.content.filter(b => b.type === 'text')
  const research = textBlocks.map(b => b.text).join('\n')
  log(`  ✅ Research complete (${research.length} chars)`)
  return research
}

// Calls Haiku once and reports whether the response was cut off by the
// token limit (stop_reason === 'max_tokens') vs. finishing naturally. That
// distinction matters: a truncated response needs more room, not a "please
// fix your syntax" nudge — asking the model to fix a JSON blob that was cut
// off mid-value just reproduces the same truncation (this is exactly what
// happened on 2026-09-01: the repair call had the same token cap and failed
// the same way).
async function callPlannerModel(client, promptText, maxTokens) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: promptText }],
  })
  const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
  return { text, truncated: response.stop_reason === 'max_tokens' }
}

function parseBlueprintJson(raw) {
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON object found in response')
  // Clean common JSON issues from LLM output
  const cleaned = jsonMatch[0]
    .replace(/,\s*}/g, '}')       // trailing commas before }
    .replace(/,\s*\]/g, ']')      // trailing commas before ]
    .replace(/[\x00-\x1F\x7F]/g, (ch) => ch === '\n' || ch === '\t' ? ch : '') // remove control chars except newline/tab
  return JSON.parse(cleaned)
}

// Generates exactly ONE series blueprint per call, rather than 2-3 at once.
// A single series's JSON is roughly a third the size of a batched request,
// which keeps it well clear of the token ceiling even as the "existing
// topics, don't duplicate" list keeps growing month over month. Returns
// null (never throws for a generation/parse failure) so the caller can
// skip this series and keep going instead of losing the whole run.
async function generateOneSeriesBlueprint(client, trendResearch, existingContent, generatedThisRun, seriesNum) {
  const priorSeries = existingContent.series.map(s => `${s.title} (${s.totalPosts} posts)`)
    .concat(generatedThisRun.map(b => `${b.title} (${b.posts.length} posts) [already planned this run]`))
  const priorTopics = existingContent.topics
    .concat(generatedThisRun.flatMap(b => b.posts.map(p => p.topicTitle)))

  const existingSummary = priorSeries.length > 0
    ? `\n\nEXISTING SERIES (do NOT duplicate these topics):\n${priorSeries.map(t => `- ${t}`).join('\n')}\n\nEXISTING TOPICS:\n${priorTopics.map(t => `- ${t}`).join('\n')}`
    : ''

  const prompt = `Based on this research about current AI trends, generate ONE new blog series blueprint — just one, not multiple.

TREND RESEARCH:
${trendResearch}
${existingSummary}

REQUIREMENTS:
- The series should have 6-8 posts
- Topics should be accessible to non-technical readers (small business owners, creators, general audience)
- The series needs a clear narrative arc (earlier posts set up later ones)
- Mix of formats — pick the format that genuinely fits each topic. Each format carries a structural contract (length, opening, required structured blocks). Available formats and what each requires:

${formatDefinitionsForPrompt()}

- Each post needs a target SEO keyword (something people actually search for)
- Slugs must be URL-friendly (lowercase, hyphens, no special chars)
- Do NOT overlap with existing series or topics listed above

RETURN FORMAT:
Return ONLY a single valid JSON object for the series. No commentary, no code blocks, no markdown, no surrounding array — just the raw JSON object.

{
  "slug": "series-slug-here",
  "title": "Series Title Here",
  "description": "One paragraph description of the series.",
  "totalPosts": 6,
  "tags": ["tag1", "tag2", "tag3"],
  "posts": [
    {
      "order": 1,
      "topicTitle": "Post Title Here",
      "topicBrief": "2-3 sentence brief explaining what this post should cover, what angle to take, and what specific examples or data to include.",
      "targetSlug": "post-slug-here",
      "targetKeyword": "seo keyword phrase",
      "format": "deep-analysis",
      "status": "pending"
    }
  ]
}`

  let { text, truncated } = await callPlannerModel(client, prompt, 4096)

  if (truncated) {
    log(`  ⚠️ Series ${seriesNum} response hit the token limit — retrying with more headroom...`)
    ;({ text, truncated } = await callPlannerModel(client, prompt, 8192))
  }

  try {
    const blueprint = parseBlueprintJson(text)
    log(`  ✅ Series ${seriesNum} generated: "${blueprint.title}"`)
    return blueprint
  } catch (firstErr) {
    if (truncated) {
      // Still cut off after doubling the budget — this is a size problem,
      // not a syntax slip. Asking the model to "fix" it would just hit the
      // same wall again, so skip this series instead of looping forever.
      log(`  ❌ Series ${seriesNum} still truncated after retry. Skipping this series.`)
      return null
    }
    log(`  ⚠️ Series ${seriesNum} JSON parse failed (${firstErr.message}), asking the model to fix it...`)
    try {
      const { text: fixText } = await callPlannerModel(
        client,
        `The following JSON has a syntax error. Fix it and return ONLY the corrected JSON object, nothing else:\n\n${text}`,
        8192
      )
      const blueprint = parseBlueprintJson(fixText)
      log(`  ✅ Series ${seriesNum} generated (after JSON fix): "${blueprint.title}"`)
      return blueprint
    } catch (secondErr) {
      log(`  ❌ Series ${seriesNum} failed to parse even after fix: ${secondErr.message}`)
      return null
    }
  }
}

function validateBlueprint(blueprint) {
  const required = ['slug', 'title', 'description', 'totalPosts', 'tags', 'posts']
  for (const field of required) {
    if (!blueprint[field]) return `Missing field: ${field}`
  }

  if (!Array.isArray(blueprint.posts) || blueprint.posts.length < 4) {
    return `Too few posts: ${blueprint.posts?.length || 0} (minimum 4)`
  }

  for (const post of blueprint.posts) {
    if (!post.topicTitle || !post.targetSlug || !post.topicBrief) {
      return `Post missing required fields: ${JSON.stringify(post)}`
    }
    if (!post.targetKeyword) post.targetKeyword = ''
    if (!post.format) post.format = 'deep-analysis'
    if (!post.status) post.status = 'pending'
  }

  blueprint.totalPosts = blueprint.posts.length
  return null
}

function saveBlueprint(blueprint) {
  const filePath = path.join(SERIES_DIR, `${blueprint.slug}.json`)

  if (fs.existsSync(filePath)) {
    log(`  ⚠️ Skipping "${blueprint.title}" — file already exists: ${blueprint.slug}.json`)
    return false
  }

  fs.writeFileSync(filePath, JSON.stringify(blueprint, null, 2) + '\n')
  log(`  📄 Saved: ${filePath}`)
  return true
}

// Returns all pending topics across every series, in the order the blog
// pipeline will consume them (series file alphabetical, then post.order).
// Used by sendMonthlyDigest to show the full upcoming queue.
function getAllPendingTopics() {
  if (!fs.existsSync(SERIES_DIR)) return []
  const files = fs.readdirSync(SERIES_DIR).filter(f => f.endsWith('.json')).sort()
  const out = []
  for (const file of files) {
    const series = JSON.parse(fs.readFileSync(path.join(SERIES_DIR, file), 'utf-8'))
    const pending = series.posts.filter(p => p.status === 'pending').sort((a, b) => a.order - b.order)
    for (const post of pending) {
      out.push({ series, post })
    }
  }
  return out
}

// Returns the next n publish dates after `from` (UTC), using the publish
// cadence Tuesday(2) and Friday(5). Used to project when each pending topic
// will go live.
function nextPublishDates(from, n) {
  const dates = []
  const cursor = new Date(from)
  while (dates.length < n) {
    cursor.setUTCDate(cursor.getUTCDate() + 1)
    const d = cursor.getUTCDay()
    if (d === 2 || d === 5) dates.push(new Date(cursor))
  }
  return dates
}

function fmtDate(d) {
  const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()]
  return `${dayName} ${d.toISOString().slice(0, 10)}`
}

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// Monthly digest email — always sent at the end of every planner run.
// Lists every pending topic with brief, format, target keyword, and the
// projected publish date based on the Tue/Fri cadence. If new series were
// generated this month, they get a short "new this month" callout at the top.
//
// User-facing purpose: give the operator a single monthly view of what Kira
// is about to write, so any title/brief edits can happen BEFORE generation
// rather than after publish.
async function sendMonthlyDigest({ newSeries, pendingTopics, genFailures = 0 }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    log('  ⚠️ No RESEND_API_KEY — skipping monthly digest email')
    return
  }

  const totalPending = pendingTopics.length
  const publishDates = nextPublishDates(new Date(), totalPending)

  let body = ''

  if (genFailures > 0) {
    body += `
      <div style="background: #FFFBEB; padding: 14px 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #D97706;">
        <p style="font-weight: 600; margin: 0; color: #B45309;">⚠️ ${genFailures} series failed to generate this run.</p>
        <p style="margin: 6px 0 0; color: #555;">Kira tried and skipped ${genFailures === 1 ? 'it' : 'them'} rather than losing the whole run — check the <code>Blog Pipeline - Planner</code> GitHub Actions log for details. Re-run manually if the queue below still looks thin: <code>gh workflow run blog-planner.yml --field force=true</code>.</p>
      </div>
    `
  }

  if (newSeries.length > 0) {
    const newSeriesList = newSeries.map(b =>
      `<li style="margin-bottom: 6px;"><strong>${escapeHtml(b.title)}</strong> (${b.posts.length} posts) — <em style="color: #666;">${escapeHtml(b.description)}</em></li>`
    ).join('')
    body += `
      <div style="background: #F3E8FF; padding: 14px 16px; border-radius: 8px; margin: 16px 0;">
        <p style="font-weight: 600; margin: 0 0 8px; color: #6B2C6B;">${newSeries.length} new series added this month</p>
        <ul style="margin: 0; padding-left: 20px; color: #333;">${newSeriesList}</ul>
      </div>
    `
  } else {
    body += `
      <p style="color: #555; margin: 16px 0;"><em>No new series were generated this month — the queue already has enough pending topics. Here's what's still coming:</em></p>
    `
  }

  if (totalPending === 0) {
    body += `
      <div style="background: #FEF2F2; padding: 14px 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #DC2626;">
        <p style="font-weight: 600; margin: 0; color: #DC2626;">⚠️ Queue is empty.</p>
        <p style="margin: 6px 0 0; color: #555;">No posts will publish until the planner generates new series. To force a new planner run now: <code>gh workflow run blog-planner.yml --field force=true</code>.</p>
      </div>
    `
  } else {
    const weeks = Math.ceil(totalPending / 2)
    body += `<h3 style="color: #333; margin-top: 24px; padding-bottom: 8px; border-bottom: 2px solid #F3E8FF;">📅 ${totalPending} topics in queue (~${weeks} week${weeks === 1 ? '' : 's'} of content)</h3>`

    // Group pending topics by series for readability.
    const bySeries = new Map()
    for (let i = 0; i < pendingTopics.length; i++) {
      const { series, post } = pendingTopics[i]
      if (!bySeries.has(series.slug)) bySeries.set(series.slug, { series, items: [] })
      bySeries.get(series.slug).items.push({ post, projectedDate: publishDates[i] })
    }

    for (const { series, items } of bySeries.values()) {
      body += `<h4 style="color: #6B2C6B; margin: 18px 0 8px;">${escapeHtml(series.title)}</h4>`
      body += `<p style="color: #888; font-size: 13px; margin: 0 0 10px;">${items.length} of ${series.totalPosts} topics pending</p>`
      for (const { post, projectedDate } of items) {
        body += `
          <div style="border-left: 3px solid #F3E8FF; padding: 8px 12px; margin: 10px 0;">
            <p style="margin: 0; font-weight: 600; color: #1a1a1a;">Part ${post.order}: ${escapeHtml(post.topicTitle)}</p>
            <p style="margin: 4px 0; color: #888; font-size: 12px;">${escapeHtml(post.format)} · projected publish: ${escapeHtml(fmtDate(projectedDate))}${post.targetKeyword ? ' · keyword: ' + escapeHtml(post.targetKeyword) : ''}</p>
            <p style="margin: 4px 0 0; color: #555; font-size: 13px;">${escapeHtml(post.topicBrief)}</p>
          </div>
        `
      }
    }
  }

  body += `
    <p style="color: #666; font-size: 13px; margin-top: 24px; padding-top: 12px; border-top: 1px solid #eee;">
      <strong>To change anything before Kira writes it:</strong> edit the relevant <code>content/series/&lt;slug&gt;.json</code>, commit, push. Change the title, brief, format, or <code>targetKeyword</code> — Kira reads those fields when she writes the post. To skip a topic, set its <code>status</code> to <code>"skipped"</code>.
    </p>
    <p style="color: #999; font-size: 13px;">— Kira, Klinchapp Blog Planner</p>
  `

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: 'Kira <kira@klinchapp.com>',
      to: ['klinchapp.info@gmail.com'],
      subject: `${genFailures > 0 ? '⚠️' : '📋'} Klinchapp blog — ${totalPending} topic${totalPending === 1 ? '' : 's'} in queue${newSeries.length > 0 ? `, ${newSeries.length} new series this month` : ''}${genFailures > 0 ? `, ${genFailures} series failed` : ''}`,
      html: `
        <div style="font-family: sans-serif; max-width: 640px;">
          <h2 style="color: #6B2C6B; margin-bottom: 4px;">Klinchapp blog — what's coming</h2>
          <p style="color: #666; margin-top: 0;">Monthly digest from the planner.</p>
          ${body}
        </div>
      `,
    })
    log(`📧 Monthly digest sent (${totalPending} pending topics, ${newSeries.length} new series, ${genFailures} generation failures)`)
  } catch (err) {
    log(`  ⚠️ Monthly digest email failed: ${err.message}`)
  }
}

// ─── Main ───────────────────────────────────────────────────

const NUM_SERIES_TO_GENERATE = 3

try {
  log('═══════════════════════════════════════')
  log('  BLOG SERIES PLANNER')
  log('═══════════════════════════════════════')

  const pendingCount = getPendingCount()
  log(`📊 Current pending topics: ${pendingCount}`)

  const forceRun = process.argv.includes('--force')
  const skipResearch = pendingCount > 10 && !forceRun

  let saved = []
  let genFailures = 0

  if (skipResearch) {
    log(`✅ Still have ${pendingCount} pending topics. Skipping trend research + series generation this month.`)
    log('   The monthly digest email will still be sent so you see what is coming.')
  } else {
    // Generation runs in its own try/catch so a failure here (a bad API
    // response, a network error, whatever) can never prevent the digest
    // email below from sending — that's the exact gap that made the
    // 2026-09-01 failure silent. Whatever happens above, the operator
    // finds out either way.
    try {
      log(`⚠️ Only ${pendingCount} pending topics remaining. Generating new series...`)

      const existingContent = getExistingContent()
      log(`📚 Existing: ${existingContent.series.length} series, ${existingContent.topics.length} topics`)

      const trendResearch = await researchTrends()

      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY')
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const client = new Anthropic({ apiKey })

      log(`📝 Step 2: Generating up to ${NUM_SERIES_TO_GENERATE} new series, one at a time...`)
      for (let i = 1; i <= NUM_SERIES_TO_GENERATE; i++) {
        let blueprint = null
        try {
          blueprint = await generateOneSeriesBlueprint(client, trendResearch, existingContent, saved, i)
        } catch (err) {
          log(`  ❌ Series ${i} generation threw: ${err.message}`)
        }

        if (!blueprint) {
          genFailures++
          continue
        }

        const error = validateBlueprint(blueprint)
        if (error) {
          log(`  ⚠️ Invalid blueprint "${blueprint.title}": ${error}`)
          genFailures++
          continue
        }

        if (saveBlueprint(blueprint)) {
          saved.push(blueprint)
        }
      }

      if (saved.length > 0) {
        log(`✅ Saved ${saved.length}/${NUM_SERIES_TO_GENERATE} new series blueprints`)
      } else {
        log('⚠️ No new blueprints were saved')
      }
      if (genFailures > 0) {
        log(`⚠️ ${genFailures} series failed to generate this run — continuing to digest anyway`)
      }
    } catch (err) {
      log(`💥 Series generation step failed: ${err.message}`)
      console.error(err)
      genFailures++
    }
  }

  // Always send the monthly digest at the end, regardless of whether new
  // series were generated or generation partly/fully failed. This gives
  // the operator a regular monthly view of what's coming, with enough lead
  // time to edit briefs or skip topics before Kira writes them — and it's
  // the only place the "queue is empty" / "generation failed" alerts live,
  // so it must run no matter what happened above.
  const pendingTopics = getAllPendingTopics()
  await sendMonthlyDigest({ newSeries: saved, pendingTopics, genFailures })

  if (genFailures > 0) {
    log(`⚠️ Planner completed with ${genFailures} failure(s). Digest sent — see above for details.`)
    process.exitCode = 1 // mark the run visibly failed in GitHub Actions without skipping anything queued after this line
  } else {
    log('🎉 Planner complete.')
  }
} catch (err) {
  // Only truly unexpected failures land here (e.g. SERIES_DIR unreadable) —
  // anything from research/generation is already caught above so the
  // digest still gets a chance to send.
  log(`💥 Planner failed: ${err.message}`)
  console.error(err)
  process.exitCode = 1
}
