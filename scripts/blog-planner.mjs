/**
 * Klinchapp Blog Series Planner
 *
 * Runs monthly to auto-generate new series blueprints.
 * Researches current AI trends, reviews existing content,
 * and creates 2-3 new series with 6-8 topics each.
 *
 * Usage:
 *   node scripts/blog-planner.mjs
 *
 * Cron: 1st of every month at 9am UTC
 */

import fs from 'fs'
import path from 'path'
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

async function generateBlueprints(trendResearch, existingContent) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY')

  log('📝 Step 2: Generating new series blueprints...')

  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey })

  const existingSummary = existingContent.series.length > 0
    ? `\n\nEXISTING SERIES (do NOT duplicate these topics):\n${existingContent.series.map(s => `- ${s.title} (${s.totalPosts} posts)`).join('\n')}\n\nEXISTING TOPICS:\n${existingContent.topics.map(t => `- ${t}`).join('\n')}`
    : ''

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `Based on this research about current AI trends, generate 2-3 new blog series blueprints.

TREND RESEARCH:
${trendResearch}
${existingSummary}

REQUIREMENTS:
- Each series should have 6-8 posts
- Topics should be accessible to non-technical readers (small business owners, creators, general audience)
- Each series needs a clear narrative arc (earlier posts set up later ones)
- Mix of formats: deep-analysis, opinion, tool-review, how-to-guide, research-breakdown
- Each post needs a target SEO keyword (something people actually search for)
- Slugs must be URL-friendly (lowercase, hyphens, no special chars)
- Do NOT overlap with existing series listed above

RETURN FORMAT:
Return ONLY a valid JSON array of series objects. No commentary, no code blocks, no markdown. Just the raw JSON array.

Each series object must follow this exact structure:
[
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
  }
]`
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON array found in response')
    // Clean common JSON issues from LLM output
    let cleaned = jsonMatch[0]
      .replace(/,\s*}/g, '}')       // trailing commas before }
      .replace(/,\s*\]/g, ']')      // trailing commas before ]
      .replace(/[\x00-\x1F\x7F]/g, (ch) => ch === '\n' || ch === '\t' ? ch : '') // remove control chars except newline/tab
    const blueprints = JSON.parse(cleaned)
    log(`  ✅ Generated ${blueprints.length} series blueprints`)
    return blueprints
  } catch (firstErr) {
    // Retry: ask the LLM to fix its own JSON
    log(`  ⚠️ JSON parse failed, asking LLM to fix...`)
    const fixResponse = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `The following JSON has a syntax error. Fix it and return ONLY the corrected JSON array, nothing else:\n\n${text}`
      }],
    })
    const fixText = fixResponse.content[0].type === 'text' ? fixResponse.content[0].text : ''
    try {
      const fixMatch = fixText.match(/\[[\s\S]*\]/)
      if (!fixMatch) throw new Error('No JSON in fix response')
      const blueprints = JSON.parse(fixMatch[0])
      log(`  ✅ Generated ${blueprints.length} series blueprints (after JSON fix)`)
      return blueprints
    } catch (secondErr) {
      log(`  ❌ Failed to parse blueprints even after fix: ${secondErr.message}`)
      throw secondErr
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

async function sendNotification(blueprints) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)

    const seriesList = blueprints.map(b =>
      `<li><strong>${b.title}</strong> (${b.posts.length} posts)<br/><em>${b.description}</em></li>`
    ).join('')

    await resend.emails.send({
      from: 'Kira <kira@klinchapp.com>',
      to: ['klinchapp.info@gmail.com'],
      subject: `📋 New blog series planned: ${blueprints.length} series added`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px;">
          <h2 style="color: #6B2C6B; margin-bottom: 4px;">New series blueprints generated</h2>
          <p style="color: #666; margin-top: 0;">The blog planner has created new content series.</p>
          <ul style="color: #333; line-height: 1.8;">${seriesList}</ul>
          <p style="color: #999; font-size: 13px;">These will be picked up automatically by the blog pipeline.</p>
          <p style="color: #999; font-size: 13px;">— Kira, Klinchapp Blog Planner</p>
        </div>
      `,
    })
    log(`📧 Notification sent`)
  } catch (err) {
    log(`  ⚠️ Email notification failed: ${err.message}`)
  }
}

// ─── Main ───────────────────────────────────────────────────

try {
  log('═══════════════════════════════════════')
  log('  BLOG SERIES PLANNER')
  log('═══════════════════════════════════════')

  // Check if we still have enough pending topics
  const pendingCount = getPendingCount()
  log(`📊 Current pending topics: ${pendingCount}`)

  const forceRun = process.argv.includes('--force')
  if (pendingCount > 10 && !forceRun) {
    log(`✅ Still have ${pendingCount} pending topics. No new blueprints needed yet.`)
    log('   Use --force to override.')
    process.exit(0)
  }

  log(`⚠️ Only ${pendingCount} pending topics remaining. Generating new series...`)

  // Get existing content to avoid duplicates
  const existingContent = getExistingContent()
  log(`📚 Existing: ${existingContent.series.length} series, ${existingContent.topics.length} topics`)

  // Research trends
  const trendResearch = await researchTrends()

  // Generate blueprints
  const blueprints = await generateBlueprints(trendResearch, existingContent)

  // Validate and save
  const saved = []
  for (const blueprint of blueprints) {
    const error = validateBlueprint(blueprint)
    if (error) {
      log(`  ⚠️ Invalid blueprint "${blueprint.title}": ${error}`)
      continue
    }
    if (saveBlueprint(blueprint)) {
      saved.push(blueprint)
    }
  }

  if (saved.length > 0) {
    log(`✅ Saved ${saved.length} new series blueprints`)
    await sendNotification(saved)
  } else {
    log('⚠️ No new blueprints were saved')
  }

  log('🎉 Planner complete.')
} catch (err) {
  log(`💥 Planner failed: ${err.message}`)
  console.error(err)
  process.exit(1)
}
