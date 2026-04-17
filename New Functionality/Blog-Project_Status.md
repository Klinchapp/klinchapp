# Klinchapp Autonomous AI Blog Engine - Project Status

**Project:** Autonomous AI Blog Engine for klinchapp.com
**PRD:** [klinchapp_ai_blog_prd.pdf](./klinchapp_ai_blog_prd.pdf)
**Start Date:** 2026-04-16
**Status:** Feature Complete - Ready for Cleanup, Build Check & Go-Live

---

## PRD Compliance

| PRD Requirement | Status | Notes |
|---|---|---|
| **Content Strategy** | | |
| 2 posts per week, fully autonomous | Done | Mon/Thu publish, Sun/Wed prepare via GitHub Actions |
| AI persona with name, voice, byline | Done | Kira - AI Content Specialist at Klinchapp |
| Series-based content (6-12 parts) | Done | 3 series, 20 topics, blueprint system |
| Content format rotation | Done | deep-analysis, opinion, tool-review, how-to-guide, research-breakdown, roundup |
| "Week in AI" monthly roundup | Deferred | Roundup format supported, needs standalone blueprint |
| **Pipeline** | | |
| Topic selection from blueprints | Done | Predefined series with SEO keywords |
| Web search for research | Done | Claude web search tool use, Step 1 |
| Content generation (800-1200 words) | Done | With SEO keyword, format type, research brief |
| Fact-check pass | Done | Separate LLM call, corrects errors |
| Plagiarism check | Done | LLM-based originality review, rewrites flagged passages |
| Link validation | Done | HTTP HEAD check on all URLs, dead links auto-removed |
| Quality scoring (min 7/10) | Done | Threshold 7, retry once if below, draft if still fails |
| Social snippets (5 platforms) | Done | X, LinkedIn, Instagram, Facebook, TikTok |
| SEO meta description generation | Done | 120-155 chars, keyword-optimised |
| Image generation | Deferred | After 10+ posts |
| Publishing via Git → Vercel | Done | Two-stage: prepare → publish with 24h buffer |
| **LLM Failover** | | |
| Multi-provider resilience | Done | 4 providers: Claude Haiku → Sonnet → GPT-4o mini → Gemini Flash |
| Retry with backoff | Done | 3 attempts per provider: immediate → 5 min → 10 min |
| **Website** | | |
| /blog index page | Done | Kira intro, series filters, post cards, pagination |
| /blog/[slug] post page | Done | MDX rendering, series nav, author bio, JSON-LD, OG cards |
| /blog/series/[slug] overview | Done | Progress bar, published/upcoming TOC |
| "Coming Next" teasers | Done | Shows next pending post per series, non-clickable |
| Social share buttons | Done | Copy link (primary), native share (mobile), X, LinkedIn |
| Related posts | Done | 2-3 related posts by tag/series relevance |
| Email subscription | Done | Supabase blog_subscribers table + API route |
| Featured image placeholder | Deferred | Posts work without, add with DALL-E later |
| **SEO** | | |
| Dynamic meta titles/descriptions | Done | Per-post, keyword-optimised |
| Open Graph + Twitter Cards | Done | Per-post |
| JSON-LD Article schema | Done | On every post page |
| Auto-generated sitemap | Done | Includes all posts + series dynamically |
| RSS feed | Done | /blog/rss.xml with auto-discovery tag |
| Canonical URLs | Done | On every post |
| Target keywords per post | Done | Stored in blueprint, woven into content |
| Internal linking | Done | Pipeline instructed to link between series posts |
| **Data & Memory** | | |
| Post history log | Done | _pipeline-log.json with full attempt details |
| Series blueprint storage | Done | JSON files with status tracking |
| **Monitoring** | | |
| Publish confirmation email | Done | Via Resend to klinchapp.info@gmail.com |
| Pipeline failure alert email | Done | Via Resend with error details |
| Health check (no post for 5+ days) | Deferred | Can add as GitHub Action later |
| **Future / Deferred** | | |
| DALL-E image generation | Deferred | After 10+ posts |
| Social API auto-posting | Deferred | After manual copy-paste gets tedious |
| GA4 analytics feedback loop | Deferred | After 1,000+ visitors |
| Social listening + AI replies | Deferred | After social presence |
| Monthly auto-planning of new series | Deferred | After current 20 topics are used |
| AI Content Engine as Product | Deferred | Phase 2 of business |

---

## Implementation Checklist

### Phase 1: Foundation - COMPLETE

- [x] **1.1** Install dependencies (next-mdx-remote, gray-matter, reading-time, @tailwindcss/typography, openai, @google/generative-ai, resend)
- [x] **1.2** Update `tailwind.config.ts` - typography plugin + content paths
- [x] **1.3** Create `lib/blog-persona.ts` - Kira persona with data/references + SEO + internal linking rules
- [x] **1.4** Create `lib/blog.ts` - utility functions + TypeScript interfaces (BlogPost, SocialSnippets, SeriesBlueprint, UpcomingPost)
- [x] **1.5** Create 3 seed series blueprints with SEO keywords + format types (20 total topics)
- [x] **1.6** Create sample MDX posts for testing

### Phase 2: Blog Frontend - COMPLETE

- [x] **2.1** Blog index page - Kira hero intro, series filters (published only), post cards, pagination
- [x] **2.2** Individual post page - MDX rendering, series nav, author bio, JSON-LD, OG/Twitter cards
- [x] **2.3** Series overview page - progress bar, published/upcoming TOC
- [x] **2.4** Blog link added to landing page header
- [x] **2.5** "Coming Next" teaser section (non-clickable until published)
- [x] **2.6** Email subscription form + API route (Supabase blog_subscribers table)
- [x] **2.7** Multi-platform social snippets card with copy button and auto-appended blog URL
- [x] **2.8** Modern share buttons (copy link, native share, X, LinkedIn)
- [x] **2.9** Related posts section (2-3 posts by tag/series relevance)

### Phase 3: SEO - COMPLETE

- [x] **3.1** Sitemap updated with dynamic blog posts and series pages
- [x] **3.2** RSS feed at `/blog/rss.xml`
- [x] **3.3** RSS auto-discovery `<link>` tag in root layout
- [x] **3.4** Target keywords in blueprints, passed to pipeline
- [x] **3.5** SEO meta description generation step in pipeline

### Phase 4: Pipeline - COMPLETE

- [x] **4.1** 8-step pipeline script (`scripts/blog-pipeline.mjs`):
  1. Research (Claude web search)
  2. Content generation (with SEO keyword, format, research brief)
  3. Fact-check pass
  4. Plagiarism check
  5. Link validation (HTTP HEAD on all URLs)
  6. Quality scoring (threshold: 7/10, retry once)
  7. Social snippets (5 platforms)
  8. Meta description generation
- [x] **4.2** Two-stage architecture: Prepare (24h before) → Publish (next day)
- [x] **4.3** 4-provider LLM failover with 3 attempts each (immediate → 5 min → 10 min)
- [x] **4.4** Content format rotation (6 format types)
- [x] **4.5** Email notifications: publish success + pipeline failure (via Resend)
- [x] **4.6** Detailed logging of every attempt to `_pipeline-log.json`
- [x] **4.7** GitHub Actions workflows:
  - `blog-prepare.yml` - Sunday & Wednesday 9am UTC
  - `blog-publish.yml` - Monday & Thursday 9am UTC (with same-day fallback)
  - Manual trigger via `workflow_dispatch`
- [x] **4.8** Pipeline tested locally - successfully generated, scored, and published posts

### Phase 5: Content Seeding & Go-Live - PENDING

- [ ] **5.1** Clean up test content (delete test posts, reset blueprint statuses)
- [ ] **5.2** Run `npm run build` to verify static generation
- [ ] **5.3** Push to GitHub
- [ ] **5.4** Add OPENAI_API_KEY and GOOGLE_AI_API_KEY to GitHub repo secrets (optional failover)
- [ ] **5.5** Run pipeline 3-4 times via GitHub Actions `workflow_dispatch` to seed content
- [ ] **5.6** Verify blog pages render correctly on production (Vercel)
- [ ] **5.7** Verify SEO: meta tags, JSON-LD, canonical URLs on live site
- [ ] **5.8** Verify RSS feed and sitemap on live site
- [ ] **5.9** Verify Vercel auto-rebuild on pipeline git push

---

## Architecture

```
GitHub Actions Cron
  ├── Sunday/Wednesday 9am UTC → PREPARE stage
  │     1. Research topic (Claude web search)
  │     2. Generate content (SEO keyword + format + research brief)
  │     3. Fact-check pass
  │     4. Plagiarism check
  │     5. Link validation (HTTP HEAD on all URLs)
  │     6. Quality score (reject if <7/10, retry once)
  │     7. Generate social snippets (5 platforms)
  │     8. Generate SEO meta description
  │     → Commit MDX as "scheduled" (invisible to readers)
  │
  └── Monday/Thursday 9am UTC → PUBLISH stage
        → Find "scheduled" post
        → Update status to "published"
        → Commit + push → Vercel rebuilds → live
        → Send confirmation email
        → If no scheduled post → fallback: prepare + publish same-day
```

**LLM Failover Chain (3 attempts each: immediate → 5 min → 10 min):**
1. Claude Haiku 4.5 (~$0.02/post)
2. Claude Sonnet 4 (~$0.06/post)
3. OpenAI GPT-4o mini (~$0.01/post)
4. Google Gemini Flash (~$0.01/post)

---

## Monthly Cost

| Item | Cost |
|------|------|
| Vercel hosting | Free (Hobby) |
| Claude Haiku 4.5 (~8 posts/month) | ~$0.16 |
| Claude web search (~8 searches/month) | ~$0.08 |
| GitHub Actions | Free |
| Supabase (subscribers table) | Free |
| Resend (notification emails) | Free tier |
| **Total (primary provider only)** | **~$0.25/month** |
| Failover providers (if triggered) | +$0.01-0.06/post |

---

## Environment Setup

- [x] `ANTHROPIC_API_KEY` - GitHub repo secret (added 2026-04-16)
- [x] `RESEND_API_KEY` - GitHub repo secret (added 2026-04-17)
- [ ] `OPENAI_API_KEY` - GitHub repo secret (optional failover)
- [ ] `GOOGLE_AI_API_KEY` - GitHub repo secret (optional failover)
- [x] `blog_subscribers` Supabase table (created 2026-04-16)

---

## Files Created

| File | Purpose |
|------|---------|
| `lib/blog.ts` | MDX parsing, post retrieval, series reading, upcoming posts |
| `lib/blog-persona.ts` | Kira persona + system prompt (data, references, SEO, internal linking rules) |
| `app/blog/page.tsx` | Blog index with Kira intro, filters, Coming Next, subscribe |
| `app/blog/[slug]/page.tsx` | Individual post with MDX, series nav, SEO, share, related posts |
| `app/blog/[slug]/social-snippets.tsx` | Multi-platform social snippet card (client component) |
| `app/blog/[slug]/share-buttons.tsx` | Modern share buttons: copy link, native share, X, LinkedIn (client component) |
| `app/blog/series/[slug]/page.tsx` | Series overview with progress bar |
| `app/blog/subscribe-form.tsx` | Email subscription form (client component) |
| `app/blog/rss.xml/route.ts` | RSS feed |
| `app/api/blog/subscribe/route.ts` | Subscription API saving to Supabase |
| `scripts/blog-pipeline.mjs` | 8-step pipeline with 4-provider failover + email notifications |
| `.github/workflows/blog-prepare.yml` | Prepare cron (Sun/Wed 9am UTC) |
| `.github/workflows/blog-publish.yml` | Publish cron (Mon/Thu 9am UTC) |
| `content/series/*.json` | 3 series blueprints (20 topics with keywords + formats) |
| `content/blog/*.mdx` | Blog posts (pipeline-generated) |
| `content/blog/_pipeline-log.json` | Pipeline execution log |

## Files Modified

| File | Change |
|------|--------|
| `package.json` | Added 6 deps + 1 dev dep |
| `tailwind.config.ts` | Typography plugin + content path |
| `app/page.tsx` | Blog link in header nav |
| `app/layout.tsx` | RSS auto-discovery link tag |
| `app/sitemap.ts` | Dynamic blog + series entries |
| `.env.example` | Failover provider key notes |

---

## Deferred Items (Future Phases)

| Item | Description | Trigger to Start |
|------|-------------|------------------|
| Featured images (DALL-E) | AI-generated hero image per post (~$0.50/mo) | After 10+ posts live |
| "Week in AI" roundup | Monthly standalone roundup post | Add blueprint entry when ready |
| Health check alerts | Alert if no post published for 5+ days | Add GitHub Action when live |
| Social API automation | Auto-post to X, LinkedIn via Buffer/X API | When manual copy-paste is tedious |
| Analytics feedback loop | GA4 data into topic selection | After 1,000+ monthly visitors |
| Social listening | Monitor mentions, AI-generated replies | After social presence established |
| Monthly auto-planning | Auto-generate new series blueprints | After current 20 topics used |
| AI Content Engine as Product | Multi-tenant pipeline for other businesses | After proving on klinchapp.com |
