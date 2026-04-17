/**
 * Klinchapp Autonomous Blog Pipeline
 *
 * Two-stage pipeline:
 *   - Stage 1 (PREPARE): Generates content, commits as "scheduled"
 *   - Stage 2 (PUBLISH): Changes "scheduled" → "published", pushes
 *
 * Usage:
 *   node scripts/blog-pipeline.mjs prepare
 *   node scripts/blog-pipeline.mjs publish
 *
 * LLM Failover: Claude Haiku → Claude Sonnet → GPT-4o mini → Gemini Flash
 * Each provider gets 3 attempts: immediate → 5 min wait → 10 min wait
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const BLOG_DIR = path.join(ROOT, 'content', 'blog')
const SERIES_DIR = path.join(ROOT, 'content', 'series')
const LOG_FILE = path.join(BLOG_DIR, '_pipeline-log.json')

// ─── Persona ────────────────────────────────────────────────

const PERSONA_SYSTEM_PROMPT = `You are Kira, an AI content specialist writing for the Klinchapp blog. Your writing style is:
- Clear and conversational, never academic or jargon-heavy
- Practical and example-driven — every concept gets a concrete example
- Optimistic about AI but honest about limitations
- Targeted at anyone interested in AI — business owners, developers, decision-makers, and curious minds
- You use short paragraphs (2-3 sentences max) and plenty of subheadings
- You never use filler phrases like "In today's rapidly evolving landscape"
- You write in first person ("I") and address the reader as "you"
- Blog posts should be 800-1200 words
- Use markdown formatting: ## for sections, **bold** for key terms, - for lists
- End every post with a clear takeaway or actionable next step
- You openly acknowledge being an AI and find it an interesting perspective to write from

DATA AND REFERENCES — this is critical for credibility:
- Back up claims with specific data: numbers, percentages, dollar figures, dates, study findings
- Cite real sources inline using markdown links: [Source Name](URL)
- Include a ## References section at the end of every post with all sources linked
- Use real company names, real tools, real research papers — never fabricate examples
- When quoting statistics, name the source and year (e.g., "according to McKinsey's 2025 AI report")
- If you cannot verify a specific number, say "estimates suggest" or "industry reports indicate" — never present uncertain data as fact
- Prefer recent data (2025-2026) over older statistics
- At minimum, every post should have 3-5 data points and 3-5 referenced sources`

// ─── Provider Definitions ───────────────────────────────────

const PROVIDERS = [
  {
    name: 'claude-haiku',
    model: 'claude-haiku-4-5-20251001',
    provider: 'anthropic',
    envKey: 'ANTHROPIC_API_KEY',
  },
  {
    name: 'claude-sonnet',
    model: 'claude-sonnet-4-20250514',
    provider: 'anthropic',
    envKey: 'ANTHROPIC_API_KEY',
  },
  {
    name: 'gpt-4o-mini',
    model: 'gpt-4o-mini',
    provider: 'openai',
    envKey: 'OPENAI_API_KEY',
  },
  {
    name: 'gemini-flash',
    model: 'gemini-2.0-flash',
    provider: 'google',
    envKey: 'GOOGLE_AI_API_KEY',
  },
]

const RETRY_DELAYS_MS = [0, 5 * 60 * 1000, 10 * 60 * 1000] // immediate, 5 min, 10 min

// ─── LLM Abstraction ───────────────────────────────────────

async function callLLM(provider, systemPrompt, userPrompt, maxTokens = 4096) {
  const apiKey = process.env[provider.envKey]
  if (!apiKey) throw new Error(`Missing API key: ${provider.envKey}`)

  const start = Date.now()

  if (provider.provider === 'anthropic') {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey })
    const response = await client.messages.create({
      model: provider.model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return {
      text,
      latency_ms: Date.now() - start,
      tokens_in: response.usage?.input_tokens || 0,
      tokens_out: response.usage?.output_tokens || 0,
    }
  }

  if (provider.provider === 'openai') {
    const OpenAI = (await import('openai')).default
    const client = new OpenAI({ apiKey })
    const response = await client.chat.completions.create({
      model: provider.model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })
    return {
      text: response.choices[0]?.message?.content || '',
      latency_ms: Date.now() - start,
      tokens_in: response.usage?.prompt_tokens || 0,
      tokens_out: response.usage?.completion_tokens || 0,
    }
  }

  if (provider.provider === 'google') {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const client = new GoogleGenerativeAI(apiKey)
    const model = client.getGenerativeModel({
      model: provider.model,
      systemInstruction: systemPrompt,
    })
    const result = await model.generateContent(userPrompt)
    const text = result.response.text()
    return {
      text,
      latency_ms: Date.now() - start,
      tokens_in: result.response.usageMetadata?.promptTokenCount || 0,
      tokens_out: result.response.usageMetadata?.candidatesTokenCount || 0,
    }
  }

  throw new Error(`Unknown provider: ${provider.provider}`)
}

// ─── Failover Engine ────────────────────────────────────────

async function callWithFailover(systemPrompt, userPrompt, maxTokens = 4096) {
  const attempts = []

  for (const provider of PROVIDERS) {
    // Skip providers without API keys configured
    if (!process.env[provider.envKey]) {
      log(`  ⏭ Skipping ${provider.name} — no API key configured`)
      continue
    }

    for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt++) {
      const delay = RETRY_DELAYS_MS[attempt]
      if (delay > 0) {
        log(`  ⏳ Waiting ${delay / 60000} min before retry...`)
        await sleep(delay)
      }

      try {
        log(`  🔄 ${provider.name} attempt ${attempt + 1}/3...`)
        const result = await callLLM(provider, systemPrompt, userPrompt, maxTokens)
        log(`  ✅ ${provider.name} succeeded (${result.latency_ms}ms, ${result.tokens_out} tokens out)`)

        attempts.push({
          provider: provider.name,
          attempt: attempt + 1,
          status: 'success',
          latency_ms: result.latency_ms,
          tokens_in: result.tokens_in,
          tokens_out: result.tokens_out,
        })

        return { ...result, provider: provider.name, attempts }
      } catch (err) {
        log(`  ❌ ${provider.name} attempt ${attempt + 1} failed: ${err.message}`)
        attempts.push({
          provider: provider.name,
          attempt: attempt + 1,
          status: 'failed',
          error: err.message,
        })
      }
    }

    log(`  ⛔ ${provider.name} exhausted all 3 attempts, moving to next provider`)
  }

  throw new Error(`All providers failed after ${attempts.length} total attempts`)
}

// ─── Pipeline Steps ─────────────────────────────────────────

function findNextTopic() {
  if (!fs.existsSync(SERIES_DIR)) return null

  const files = fs.readdirSync(SERIES_DIR).filter(f => f.endsWith('.json'))
  for (const file of files) {
    const series = JSON.parse(fs.readFileSync(path.join(SERIES_DIR, file), 'utf-8'))
    const pendingPost = series.posts.find(p => p.status === 'pending')
    if (pendingPost) {
      // Gather previously published posts for context and internal linking
      const previousParts = series.posts
        .filter(p => (p.status === 'published' || p.status === 'scheduled') && p.order < pendingPost.order)
        .map(p => ({ title: `Part ${p.order}: ${p.topicTitle}`, slug: p.targetSlug }))

      return { series, post: pendingPost, previousParts }
    }
  }

  return null
}

function findScheduledPost() {
  if (!fs.existsSync(BLOG_DIR)) return null

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'))
  for (const file of files) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8')
    const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---/)
    if (!frontmatterMatch) continue

    // Simple YAML parsing for status field
    const statusMatch = frontmatterMatch[1].match(/^status:\s*"?(\w+)"?/m)
    if (statusMatch && statusMatch[1] === 'scheduled') {
      return { file, content: raw }
    }
  }

  return null
}

async function researchTopic(topic) {
  const { post } = topic
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    log('  ⚠️ No ANTHROPIC_API_KEY — skipping web research')
    return null
  }

  log('🌐 Step 1: Researching topic with web search...')

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      tools: [{ type: 'web_search_20250305' }],
      messages: [{
        role: 'user',
        content: `Research this topic for a blog post: "${post.topicTitle}"

Brief: ${post.topicBrief}
${post.targetKeyword ? `SEO keyword: "${post.targetKeyword}"` : ''}

Find and compile:
1. Recent statistics and data points (2025-2026 preferred)
2. Real company names and case studies
3. Expert opinions or quotes
4. Recent news or developments on this topic
5. Credible source URLs for citations

Return a structured research brief with all findings and source URLs. Focus on facts, data, and real examples — not generic information.`
      }],
    })

    // Extract text from response (web search may include tool_use blocks)
    const textBlocks = response.content.filter(b => b.type === 'text')
    const research = textBlocks.map(b => b.text).join('\n')

    log(`  ✅ Research complete (${research.length} chars)`)
    return research
  } catch (err) {
    log(`  ⚠️ Web research failed: ${err.message} — proceeding without research`)
    return null
  }
}

async function generateContent(topic, researchBrief) {
  const { series, post, previousParts } = topic

  const previousContext = previousParts.length > 0
    ? `\n\nPreviously published in this series:\n${previousParts.map(p => `- ${p.title} → /blog/${p.slug}`).join('\n')}\nDo NOT repeat content from these posts. Build on them, reference them, and link back to them using [descriptive text](/blog/slug) where relevant.`
    : ''

  const keywordInstruction = post.targetKeyword
    ? `\nTarget SEO keyword: "${post.targetKeyword}"\n- Use this keyword naturally 3-5 times throughout the post\n- Include it in the first paragraph and at least one H2 heading\n- Also use related keywords and synonyms naturally`
    : ''

  const formatInstructions = {
    'deep-analysis': 'Write an in-depth analytical piece. Explore the topic with research, data, multiple perspectives, and nuanced conclusions. Structure with clear sections building a logical argument.',
    'opinion': 'Write an opinionated piece where you (Kira) take a clear stance and argue it. Be bold, back your position with evidence, and acknowledge counterarguments. Let your personality show.',
    'tool-review': 'Write a practical review/comparison piece. Evaluate specific tools or platforms with pros, cons, pricing, and real use cases. Be fair and specific — name names.',
    'how-to-guide': 'Write a step-by-step practical guide. Focus on actionable instructions the reader can follow immediately. Include numbered steps, templates, or checklists where appropriate.',
    'research-breakdown': 'Summarise and contextualise research findings or industry data. Make academic or complex findings accessible. Explain why the data matters and what readers should do about it.',
    'roundup': 'Write a curated summary of recent developments. Cover 5-7 key items with brief analysis of each. Focus on what matters and why. Include links to original sources.',
  }

  const formatType = post.format || 'deep-analysis'
  const formatInstruction = formatInstructions[formatType] || formatInstructions['deep-analysis']

  const researchContext = researchBrief
    ? `\n\nRESEARCH BRIEF (use this data and these sources in your post):\n${researchBrief}`
    : ''

  const userPrompt = `Write a blog post with the following specifications:

Title: ${post.topicTitle}
Brief: ${post.topicBrief}
Series: "${series.title}" (post ${post.order} of ${series.totalPosts})
Format: ${formatType}
${formatInstruction}
${keywordInstruction}
${previousContext}
${researchContext}

Requirements:
- 800-1200 words
- Use ## for section headings that include relevant search terms where natural
- Include at least 3-5 data points with specific numbers
- Include at least 3-5 references to real sources with URLs
- End with a ## References section listing all sources
- End the main content with a clear takeaway
- If this is not the last post in the series, include a teaser for the next topic
- Do NOT include the title as an H1 — the blog template adds it automatically
- Write in markdown format
- Do NOT wrap the output in code blocks`

  log('📝 Step 2: Generating content...')
  return await callWithFailover(PERSONA_SYSTEM_PROMPT, userPrompt, 4096)
}

async function factCheck(content) {
  const userPrompt = `Review this blog post for factual accuracy. Check:

1. Are statistics and data points plausible and correctly attributed?
2. Are company names, tool names, and product details accurate?
3. Are any claims misleading, outdated, or unsupported?
4. Are the URLs in references likely to be real pages?

If you find issues:
- Correct factual errors
- Remove or rephrase unverifiable claims
- Replace suspicious URLs with more reliable source references
- Add "[citation needed]" for claims you cannot verify but seem plausible

Return ONLY the corrected blog post content. No commentary, no preamble, no code blocks.

---
${content}`

  log('🔍 Step 2: Fact-checking...')
  return await callWithFailover(
    'You are a meticulous fact-checker. Review content for accuracy and correct errors.',
    userPrompt,
    4096
  )
}

async function plagiarismCheck(content) {
  const userPrompt = `You are an originality reviewer. Analyse this blog post for potential plagiarism issues.

Check for:
1. Passages that are commonly found verbatim on other websites, Wikipedia, or news sources
2. Distinctive phrasing, sentences, or paragraph structures that likely belong to another author
3. Sections that read like they were copied from a textbook, research paper, or well-known article
4. Lists, definitions, or explanations that are word-for-word matches of commonly published content
5. Any content that a plagiarism detection tool like Copyscape would likely flag

For EVERY flagged passage:
- Rewrite it in original language while preserving the meaning and factual accuracy
- Keep the same tone and style as the rest of the post
- Ensure rewritten sections still flow naturally with surrounding content

If no issues are found, return the content unchanged.

Return ONLY the final blog post content (with any rewrites applied). No commentary, no preamble, no code blocks.

---
${content}`

  log('🔎 Step 3: Plagiarism check...')
  return await callWithFailover(
    'You are an originality and plagiarism reviewer. Rewrite any passages that appear copied from other sources.',
    userPrompt,
    4096
  )
}

async function validateLinks(content) {
  // Extract all URLs from markdown links: [text](url)
  const urlRegex = /\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g
  const urls = []
  let match
  while ((match = urlRegex.exec(content)) !== null) {
    urls.push({ text: match[1], url: match[2] })
  }

  if (urls.length === 0) {
    log('🔗 Step 4: Link validation — no URLs found')
    return content
  }

  log(`🔗 Step 4: Link validation — checking ${urls.length} URLs...`)
  let updatedContent = content
  let removed = 0

  for (const { text, url } of urls) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': 'KlinchappBot/1.0' },
        redirect: 'follow',
      })
      clearTimeout(timeout)

      if (response.ok) {
        log(`  ✅ ${url}`)
      } else {
        log(`  ❌ ${url} → ${response.status}, removing`)
        updatedContent = updatedContent.replace(`[${text}](${url})`, text)
        removed++
      }
    } catch (err) {
      log(`  ❌ ${url} → ${err.message}, removing`)
      updatedContent = updatedContent.replace(`[${text}](${url})`, text)
      removed++
    }
  }

  log(`🔗 Link validation complete: ${urls.length - removed} valid, ${removed} removed`)
  return updatedContent
}

async function qualityScore(content) {
  const userPrompt = `Score this blog post from 1-10 on each criterion:

- clarity: Is it easy to understand? Are paragraphs short? Is jargon avoided?
- actionability: Does it give practical, specific advice the reader can use?
- engagement: Would a reader finish the whole post? Is it interesting?
- accuracy: Are claims supported by data and references? Are sources cited?
- overall: Your holistic assessment of publish-readiness.

Return ONLY a valid JSON object, nothing else:
{"clarity": N, "actionability": N, "engagement": N, "accuracy": N, "overall": N}

---
${content}`

  log('📊 Step 5: Quality scoring...')
  const result = await callWithFailover(
    'You are a content quality assessor. Return only valid JSON.',
    userPrompt,
    256
  )

  try {
    // Extract JSON from response (handle cases where LLM wraps it in text)
    const jsonMatch = result.text.match(/\{[\s\S]*?\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')
    const scores = JSON.parse(jsonMatch[0])
    return { scores, ...result }
  } catch (err) {
    log(`  ⚠️ Failed to parse quality scores: ${err.message}`)
    return { scores: { clarity: 5, actionability: 5, engagement: 5, accuracy: 5, overall: 5 }, ...result }
  }
}

async function generateSocialSnippets(title, brief, slug) {
  const postUrl = `https://www.klinchapp.com/blog/${slug}`

  const userPrompt = `Generate social media snippets to promote this blog post:

Title: "${title}"
Summary: ${brief}
URL: ${postUrl}

Generate a snippet for EACH platform. Follow these rules strictly:

X/TWITTER (under 260 chars, leave room for link):
- Punchy hook, intriguing not clickbait
- 1-2 relevant hashtags
- Do NOT include the URL (it will be added automatically)

LINKEDIN (2-3 paragraphs):
- Professional but engaging
- Use line breaks and numbered lists
- 2-3 hashtags
- End with "Read more on the Klinchapp blog" (URL added automatically)

INSTAGRAM (with emojis):
- Visual, engaging, use emojis and line breaks
- 5-8 hashtags at the end
- Say "Link in bio" (not the URL)

FACEBOOK (conversational):
- Conversational, encourage engagement
- 1-2 paragraphs
- End with "👉 Read the full post on the Klinchapp blog" (URL added automatically)

TIKTOK (Gen-Z friendly):
- Casual, trendy, use emojis
- 3-5 hashtags
- Short and punchy

Return ONLY a valid JSON object with this exact structure, no other text:
{"twitter": "...", "linkedin": "...", "instagram": "...", "facebook": "...", "tiktok": "..."}`

  log('📱 Step 6: Generating social snippets...')
  const result = await callWithFailover(
    'You are a social media content specialist. Return only valid JSON.',
    userPrompt,
    2048
  )

  try {
    const jsonMatch = result.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')
    const snippets = JSON.parse(jsonMatch[0])
    return { snippets, ...result }
  } catch (err) {
    log(`  ⚠️ Failed to parse social snippets: ${err.message}`)
    return {
      snippets: {
        twitter: `New post: ${title}`,
        linkedin: `New post on the Klinchapp blog: ${title}\n\n${brief}`,
        instagram: `New post 📝 ${title}\n\n${brief}\n\nLink in bio`,
        facebook: `New on the Klinchapp blog: ${title}\n\n${brief}`,
        tiktok: `${title} ✨ Link in bio`,
      },
      ...result,
    }
  }
}

async function generateMetaDescription(title, content, targetKeyword) {
  const userPrompt = `Write a meta description for this blog post.

Title: "${title}"
Target keyword: "${targetKeyword || ''}"
Content summary: ${content.substring(0, 500)}...

Rules:
- Exactly 120-155 characters (this is critical — count carefully)
- Include the target keyword naturally
- Make it compelling — this is what appears in Google search results
- Write in Kira's voice (conversational, direct)
- Do NOT start with "In this post" or "This article"
- End with a value proposition or hook

Return ONLY the meta description text, nothing else.`

  log('🔎 Step 7: Generating meta description...')
  const result = await callWithFailover(
    'You write SEO meta descriptions. Return only the description text, no quotes, no labels.',
    userPrompt,
    100
  )

  // Clean up — remove quotes if the LLM wrapped it
  let desc = result.text.trim().replace(/^["']|["']$/g, '')
  // Truncate if too long
  if (desc.length > 160) desc = desc.substring(0, 157) + '...'

  return { description: desc, ...result }
}

function assembleMdx(topic, content, scores, snippets, metaDescription, status) {
  const { series, post } = topic
  const now = new Date().toISOString()

  // Escape quotes in snippets for YAML
  const escYaml = (s) => s.replace(/"/g, '\\"').replace(/\n/g, '\\n')

  const frontmatter = `---
title: "${post.topicTitle.replace(/"/g, '\\"')}"
slug: "${post.targetSlug}"
description: "${metaDescription.replace(/"/g, '\\"')}"
publishedAt: "${now}"
series: "${series.slug}"
seriesOrder: ${post.order}
tags: ${JSON.stringify(series.tags)}
targetKeyword: "${(post.targetKeyword || '').replace(/"/g, '\\"')}"
author: "Kira"
social:
  twitter: "${escYaml(snippets.twitter)}"
  linkedin: "${escYaml(snippets.linkedin)}"
  instagram: "${escYaml(snippets.instagram)}"
  facebook: "${escYaml(snippets.facebook)}"
  tiktok: "${escYaml(snippets.tiktok)}"
qualityScore: ${scores.overall}
status: "${status}"
---`

  return `${frontmatter}\n\n${content}\n`
}

function updateSeriesBlueprint(seriesSlug, postSlug, newStatus) {
  const filePath = path.join(SERIES_DIR, `${seriesSlug}.json`)
  const series = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  const post = series.posts.find(p => p.targetSlug === postSlug)
  if (post) {
    post.status = newStatus
  }

  fs.writeFileSync(filePath, JSON.stringify(series, null, 2) + '\n')
}

function appendLog(entry) {
  let log = []
  if (fs.existsSync(LOG_FILE)) {
    try { log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8')) } catch {}
  }
  log.push(entry)
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2) + '\n')
}

// ─── Stage 1: Prepare ───────────────────────────────────────

async function stagePrepare() {
  log('═══════════════════════════════════════')
  log('  STAGE 1: PREPARE')
  log('═══════════════════════════════════════')

  const topic = findNextTopic()
  if (!topic) {
    log('No pending topics found. All series are complete.')
    return
  }

  log(`📌 Selected: "${topic.post.topicTitle}" (${topic.series.title}, Part ${topic.post.order})`)

  let contentResult, factCheckResult, scoreResult, socialResult
  let finalContent, scores, snippets
  let allAttempts = []
  let qualityPassed = false

  // Research (web search — runs once, reused on quality retry)
  const researchBrief = await researchTopic(topic)

  // Quality loop: generate → fact-check → score. Retry once if score < 7
  for (let qualityAttempt = 0; qualityAttempt < 2; qualityAttempt++) {
    if (qualityAttempt > 0) {
      log('🔄 Quality too low, regenerating with fresh attempt...')
    }

    // Generate content
    contentResult = await generateContent(topic, researchBrief)
    allAttempts.push(...contentResult.attempts)

    // Fact-check
    factCheckResult = await factCheck(contentResult.text)
    allAttempts.push(...factCheckResult.attempts)

    // Plagiarism check
    const plagiarismResult = await plagiarismCheck(factCheckResult.text)
    allAttempts.push(...plagiarismResult.attempts)

    // Link validation
    finalContent = await validateLinks(plagiarismResult.text)

    // Quality score
    scoreResult = await qualityScore(finalContent)
    allAttempts.push(...scoreResult.attempts)
    scores = scoreResult.scores

    log(`📊 Quality scores: clarity=${scores.clarity} actionability=${scores.actionability} engagement=${scores.engagement} accuracy=${scores.accuracy} overall=${scores.overall}`)

    if (scores.overall >= 7) {
      qualityPassed = true
      break
    }
  }

  const status = qualityPassed ? 'scheduled' : 'draft'
  log(`📋 Post status: ${status}${!qualityPassed ? ' (held for review — quality below threshold)' : ''}`)

  // Generate social snippets
  socialResult = await generateSocialSnippets(topic.post.topicTitle, topic.post.topicBrief, topic.post.targetSlug)
  allAttempts.push(...socialResult.attempts)
  snippets = socialResult.snippets

  // Generate SEO meta description
  const metaResult = await generateMetaDescription(topic.post.topicTitle, finalContent, topic.post.targetKeyword)
  allAttempts.push(...metaResult.attempts)
  const metaDescription = metaResult.description

  // Assemble MDX
  const mdxContent = assembleMdx(topic, finalContent, scores, snippets, metaDescription, status)
  const mdxPath = path.join(BLOG_DIR, `${topic.post.targetSlug}.mdx`)

  // Ensure content/blog directory exists
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true })
  }

  fs.writeFileSync(mdxPath, mdxContent)
  log(`📄 Written: ${mdxPath}`)

  // Update series blueprint
  updateSeriesBlueprint(topic.series.slug, topic.post.targetSlug, status === 'scheduled' ? 'published' : 'draft')
  log(`📘 Updated blueprint: ${topic.series.slug}`)

  // Log
  const logEntry = {
    date: new Date().toISOString(),
    stage: 'prepare',
    series: topic.series.slug,
    post: topic.post.targetSlug,
    title: topic.post.topicTitle,
    status,
    qualityScore: scores.overall,
    scores,
    final_provider: contentResult.provider,
    total_attempts: allAttempts.length,
    attempts: allAttempts,
  }
  appendLog(logEntry)

  log(`✅ Prepare complete: "${topic.post.topicTitle}" → ${status}`)
}

// ─── Stage 2: Publish ───────────────────────────────────────

async function stagePublish() {
  log('═══════════════════════════════════════')
  log('  STAGE 2: PUBLISH')
  log('═══════════════════════════════════════')

  const scheduled = findScheduledPost()

  if (!scheduled) {
    log('No scheduled posts found.')
    log('Running fallback: prepare + publish in one go...')

    // Fallback: run prepare, then try to publish whatever was created
    await stagePrepare()

    const retryScheduled = findScheduledPost()
    if (!retryScheduled) {
      log('⚠️ Fallback prepare did not produce a publishable post. Skipping.')
      return
    }

    await publishFile(retryScheduled)
    return
  }

  await publishFile(scheduled)
}

async function publishFile(scheduled) {
  const filePath = path.join(BLOG_DIR, scheduled.file)
  let content = scheduled.content

  // Extract title from frontmatter
  const titleMatch = content.match(/title:\s*"([^"]*)"/)
  const slugMatch = content.match(/slug:\s*"([^"]*)"/)
  const postTitle = titleMatch ? titleMatch[1] : scheduled.file
  const postSlug = slugMatch ? slugMatch[1] : scheduled.file.replace('.mdx', '')

  // Update status from "scheduled" to "published"
  content = content.replace(/status:\s*"scheduled"/, 'status: "published"')

  // Update publishedAt to now
  const now = new Date().toISOString()
  content = content.replace(/publishedAt:\s*"[^"]*"/, `publishedAt: "${now}"`)

  fs.writeFileSync(filePath, content)
  log(`✅ Published: ${scheduled.file}`)

  // Send notification email
  await sendPublishNotification(postTitle, postSlug)

  // Log
  const logEntry = {
    date: now,
    stage: 'publish',
    file: scheduled.file,
    status: 'published',
  }
  appendLog(logEntry)
}

async function sendPublishNotification(title, slug) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    log('  ⚠️ No RESEND_API_KEY — skipping email notification')
    return
  }

  const postUrl = `https://www.klinchapp.com/blog/${slug}`

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)

    await resend.emails.send({
      from: 'Kira <kira@klinchapp.com>',
      to: ['klinchapp.info@gmail.com'],
      subject: `✅ Blog published: ${title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px;">
          <h2 style="color: #6B2C6B; margin-bottom: 4px;">New post published</h2>
          <p style="color: #666; margin-top: 0;">The Klinchapp blog has been updated.</p>
          <div style="background: #F3E8FF; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="font-weight: bold; color: #1a1a1a; margin: 0 0 8px 0;">${title}</p>
            <a href="${postUrl}" style="color: #6B2C6B; font-weight: 600;">${postUrl}</a>
          </div>
          <p style="color: #999; font-size: 13px;">— Kira, Klinchapp Blog Pipeline</p>
        </div>
      `,
    })
    log(`📧 Notification sent to klinchapp.info@gmail.com`)
  } catch (err) {
    log(`  ⚠️ Email notification failed: ${err.message}`)
  }
}

// ─── Utilities ──────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`)
}

// ─── Main ───────────────────────────────────────────────────

const stage = process.argv[2]

if (!stage || !['prepare', 'publish'].includes(stage)) {
  console.error('Usage: node scripts/blog-pipeline.mjs <prepare|publish>')
  process.exit(1)
}

try {
  if (stage === 'prepare') {
    await stagePrepare()
  } else {
    await stagePublish()
  }
  log('🎉 Pipeline complete.')
} catch (err) {
  log(`💥 Pipeline failed: ${err.message}`)
  console.error(err)

  // Log the failure
  appendLog({
    date: new Date().toISOString(),
    stage,
    status: 'failed',
    error: err.message,
  })

  // Send failure alert
  await sendFailureAlert(stage, err.message)

  process.exit(1)
}

async function sendFailureAlert(stage, errorMessage) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)

    await resend.emails.send({
      from: 'Kira <kira@klinchapp.com>',
      to: ['klinchapp.info@gmail.com'],
      subject: `❌ Blog pipeline FAILED: ${stage} stage`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px;">
          <h2 style="color: #dc2626; margin-bottom: 4px;">Pipeline Failure</h2>
          <p style="color: #666; margin-top: 0;">The Klinchapp blog pipeline failed during the <strong>${stage}</strong> stage.</p>
          <div style="background: #fef2f2; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #fecaca;">
            <p style="font-weight: bold; color: #1a1a1a; margin: 0 0 8px 0;">Error:</p>
            <p style="color: #dc2626; margin: 0; font-family: monospace; font-size: 13px;">${errorMessage}</p>
          </div>
          <p style="color: #666; font-size: 13px;">Check the GitHub Actions log for details. The pipeline will retry on the next scheduled run.</p>
          <p style="color: #999; font-size: 13px;">— Kira, Klinchapp Blog Pipeline</p>
        </div>
      `,
    })
    log(`📧 Failure alert sent`)
  } catch (mailErr) {
    log(`  ⚠️ Could not send failure alert: ${mailErr.message}`)
  }
}
