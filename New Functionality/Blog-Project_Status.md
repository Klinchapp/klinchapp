# Klinchapp Autonomous AI Blog Engine - Project Status

**Project:** Autonomous AI Blog Engine for klinchapp.com
**PRD:** [klinchapp_ai_blog_prd.pdf](./klinchapp_ai_blog_prd.pdf)
**Start Date:** 2026-04-16
**Go-Live Date:** 2026-04-17
**Status:** LIVE - Fully Autonomous
**First Post:** [AI-Generated Content: Why Quality Beats Quantity Every Time](https://www.klinchapp.com/blog/ai-content-quality-over-quantity)
**GitHub PR:** [#1 - Autonomous AI Blog Engine](https://github.com/Klinchapp/klinchapp/pull/1) (merged)

---

## PRD Compliance

| PRD Requirement | Status | Notes |
|---|---|---|
| **Content Strategy** | | |
| 2 posts per week, fully autonomous | Done | Tue/Fri publish, Mon/Thu prepare via GitHub Actions |
| AI persona with name, voice, byline | Done | Kira - AI Content Specialist at Klinchapp |
| Series-based content (6-12 parts) | Done | 3 series, 20 topics, blueprint system |
| Content format rotation | Done | deep-analysis, opinion, tool-review, how-to-guide, research-breakdown, roundup |
| "Week in AI" monthly roundup | Deferred | Roundup format supported, needs standalone blueprint |
| **Pipeline** | | |
| Topic selection from blueprints | Done | Predefined series with SEO keywords + format types |
| Web search for research | Done | Claude web search tool use, Step 1 of pipeline |
| Content generation (800-1200 words) | Done | With SEO keyword, format type, research brief, internal linking |
| Fact-check pass | Done | Separate LLM call, corrects errors and unsupported claims |
| Plagiarism check | Done | LLM-based originality review, rewrites flagged passages |
| Link validation | Done | HTTP HEAD check on all URLs, dead links auto-removed |
| Quality scoring (min 7/10) | Done | Threshold 7, retry once if below, status "draft" if still fails |
| Social snippets (5 platforms) | Done | X, LinkedIn, Instagram, Facebook, TikTok with blog URL |
| SEO meta description generation | Done | 120-155 chars, keyword-optimised |
| Image generation | Deferred | After 10+ posts |
| Publishing via Git → Vercel | Done | Two-stage: prepare → publish with 24h buffer |
| **LLM Failover** | | |
| Multi-provider resilience | Done | 4 providers: Claude Haiku → Sonnet → GPT-4o mini → Gemini Flash |
| Retry with backoff | Done | 3 attempts per provider: immediate → 5 min wait → 10 min wait |
| **Website** | | |
| /blog index page | Done | Kira hero intro, series filters (published only), post cards, pagination |
| /blog/[slug] post page | Done | MDX rendering, series nav, author bio, JSON-LD, OG cards |
| /blog/series/[slug] overview | Done | Progress bar, published/upcoming TOC |
| "Coming Next" teasers | Done | Shows next pending post per series, non-clickable pills |
| Social share buttons | Done | Copy link (primary), native share (mobile), X, LinkedIn |
| Related posts | Done | 2-3 related posts by tag/series relevance |
| Email subscription | Done | Supabase blog_subscribers table + API route |
| Blog link in navigation | Done | Added to both landing page header AND dashboard header |
| Featured image placeholder | Deferred | Posts work without, add with DALL-E later |
| **SEO** | | |
| Dynamic meta titles/descriptions | Done | Per-post, keyword-optimised via pipeline |
| Open Graph + Twitter Cards | Done | Per-post with proper article type |
| JSON-LD Article schema | Done | On every post page |
| Auto-generated sitemap | Done | Includes all posts + series dynamically |
| RSS feed | Done | /blog/rss.xml with auto-discovery `<link>` tag in layout |
| Canonical URLs | Done | On every post |
| Target keywords per post | Done | Stored in blueprint, woven into content 3-5 times naturally |
| Internal linking | Done | Pipeline links between series posts using descriptive anchor text |
| **Data & Memory** | | |
| Post history log | Done | _pipeline-log.json with provider, attempts, latency, tokens, cost |
| Series blueprint storage | Done | JSON files with status tracking per post |
| **Monitoring & Notifications** | | |
| Publish confirmation email | Done | Via Resend to klinchapp.info@gmail.com with title + URL |
| Pipeline failure alert email | Done | Via Resend with error details and stage info |
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

- [x] **1.1** Install dependencies (next-mdx-remote v6, gray-matter, reading-time, @tailwindcss/typography, openai, @google/generative-ai, resend)
- [x] **1.2** Update `tailwind.config.ts` - typography plugin + `content/**/*.mdx` path
- [x] **1.3** Create `lib/blog-persona.ts` - Kira persona with data/references + SEO + internal linking rules
- [x] **1.4** Create `lib/blog.ts` - utility functions + TypeScript interfaces (BlogPost, SocialSnippets, SeriesBlueprint, UpcomingPost)
- [x] **1.5** Create 3 seed series blueprints with SEO keywords + format types (20 total topics)
- [x] **1.6** Create sample MDX posts for local testing

### Phase 2: Blog Frontend - COMPLETE

- [x] **2.1** Blog index page (`app/blog/page.tsx`) - Kira hero intro, series filters (published only), post cards, pagination
- [x] **2.2** Individual post page (`app/blog/[slug]/page.tsx`) - MDX rendering, series nav, author bio, JSON-LD, OG/Twitter cards
- [x] **2.3** Series overview page (`app/blog/series/[slug]/page.tsx`) - progress bar, published/upcoming TOC
- [x] **2.4** Blog link added to landing page header (`app/page.tsx`)
- [x] **2.5** Blog link added to dashboard header (`app/dashboard/page.tsx`)
- [x] **2.6** "Coming Next" teaser section (non-clickable pills until published)
- [x] **2.7** Email subscription form (`app/blog/subscribe-form.tsx`) + API route (`app/api/blog/subscribe/route.ts`) → Supabase `blog_subscribers` table
- [x] **2.8** Multi-platform social snippets card (`app/blog/[slug]/social-snippets.tsx`) with copy button and auto-appended blog URL (Instagram excluded from URL)
- [x] **2.9** Modern share buttons (`app/blog/[slug]/share-buttons.tsx`) - copy link (primary, plum branded), native share (mobile), X, LinkedIn
- [x] **2.10** Related posts section - 2-3 posts ranked by tag overlap + series match

### Phase 3: SEO - COMPLETE

- [x] **3.1** Sitemap (`app/sitemap.ts`) updated with dynamic blog posts and series pages
- [x] **3.2** RSS feed at `/blog/rss.xml` (`app/blog/rss.xml/route.ts`)
- [x] **3.3** RSS auto-discovery `<link>` tag added to root layout (`app/layout.tsx`)
- [x] **3.4** Target keywords defined per post in blueprints, passed to pipeline
- [x] **3.5** SEO meta description generation step in pipeline (120-155 chars)

### Phase 4: Pipeline - COMPLETE

- [x] **4.1** 8-step pipeline script (`scripts/blog-pipeline.mjs`):
  1. Research (Claude web search for current data + sources)
  2. Content generation (with SEO keyword, format type, research brief, previous parts context)
  3. Fact-check pass (separate LLM call, corrects errors)
  4. Plagiarism check (LLM-based originality review, rewrites flagged passages)
  5. Link validation (HTTP HEAD check on all URLs, dead links removed)
  6. Quality scoring (threshold 7/10, retry once if below, "draft" if still fails)
  7. Social snippets (X, LinkedIn, Instagram, Facebook, TikTok)
  8. Meta description generation (120-155 chars, keyword-optimised)
- [x] **4.2** Two-stage architecture: Prepare (24h before) → Publish (next day)
- [x] **4.3** 4-provider LLM failover with 3 attempts each (immediate → 5 min → 10 min)
  - Claude Haiku 4.5 (primary)
  - Claude Sonnet 4 (same SDK fallback)
  - OpenAI GPT-4o mini (different provider)
  - Google Gemini Flash (third provider)
- [x] **4.4** Content format rotation (6 format types with format-specific prompt instructions)
- [x] **4.5** Email notifications via Resend:
  - Publish success: post title + URL to klinchapp.info@gmail.com
  - Pipeline failure: error details + stage info to klinchapp.info@gmail.com
- [x] **4.6** Detailed logging of every attempt to `content/blog/_pipeline-log.json` (provider, attempt, status, latency, tokens)
- [x] **4.7** GitHub Actions workflows:
  - `blog-prepare.yml` - Monday & Thursday 9am UTC (prepare 24h before publish)
  - `blog-publish.yml` - Tuesday & Friday 9am UTC (publish + email notification)
  - Both support manual trigger via `workflow_dispatch`
  - Commits as "Kira (Blog Pipeline)" <kira@klinchapp.com>
- [x] **4.8** Pipeline tested locally and in production via GitHub Actions

### Phase 5: Go-Live - COMPLETE

- [x] **5.1** Cleaned up all test content (deleted sample posts, reset all blueprint statuses)
- [x] **5.2** Verified `npm run build` passes with static generation
- [x] **5.3** Created feature branch, PR (#1), merged to main
- [x] **5.4** Resolved Vercel build issues:
  - Fixed missing dependencies after rebase conflict resolution
  - Upgraded next-mdx-remote from v5 to v6 (Vercel security check)
  - Fixed GitHub Actions push permissions (PAT_TOKEN)
- [x] **5.5** Triggered pipeline via GitHub Actions `workflow_dispatch` to seed first post
- [x] **5.6** Verified blog pages render correctly on production (klinchapp.com/blog)
- [x] **5.7** Verified first post live: [AI-Generated Content: Why Quality Beats Quantity Every Time](https://www.klinchapp.com/blog/ai-content-quality-over-quantity)
- [x] **5.8** Verified email notification received at klinchapp.info@gmail.com
- [x] **5.9** Verified Vercel auto-rebuild on pipeline git push
- [x] **5.10** Blog link added to dashboard header (logged-in state)

---

## Architecture

```
GitHub Actions Cron
  ├── Monday/Thursday 9am UTC → PREPARE stage
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
  └── Tuesday/Friday 9am UTC → PUBLISH stage
        → Find "scheduled" post
        → Update status to "published"
        → Update publishedAt timestamp
        → Commit + push → Vercel rebuilds → post goes live
        → Send confirmation email via Resend
        → If no scheduled post → fallback: run prepare + publish same-day
```

**LLM Failover Chain (3 attempts each: immediate → 5 min → 10 min):**
1. Claude Haiku 4.5 (~$0.02/post) - primary
2. Claude Sonnet 4 (~$0.06/post) - same SDK, better quality
3. OpenAI GPT-4o mini (~$0.01/post) - different provider entirely
4. Google Gemini Flash (~$0.01/post) - third provider
- Worst case: ~60 minutes across all 12 attempts before giving up

---

## Series Blueprints

| Series | Posts | Topics | Status |
|--------|-------|--------|--------|
| AI Content Creation: The Complete Playbook | 6 | Quality vs quantity, training AI on your style, blog writing workflow, social media platforms, ethics, future of AI content | 1 published, 5 pending |
| AI for Small Business: A Practical Guide | 8 | Where to start, 5 tools, prompts, chatbots, social media, costs, mistakes, 30-day plan | All pending |
| Understanding AI: From Zero to Informed | 6 | What is AI, ChatGPT vs Claude vs Gemini, how AI learns, hallucinations, ethics, AI literacy | All pending |
| **Total** | **20** | | **1 published, 19 pending** |

---

## Monthly Cost (Production)

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

## Environment Setup (Production)

| Secret | Location | Status |
|--------|----------|--------|
| `ANTHROPIC_API_KEY` | GitHub repo secret | Done (2026-04-16) |
| `RESEND_API_KEY` | GitHub repo secret | Done (2026-04-17) |
| `PAT_TOKEN` | GitHub repo secret (fine-grained PAT for pipeline git push) | Done (2026-04-17) |
| `OPENAI_API_KEY` | GitHub repo secret (optional failover) | Not yet |
| `GOOGLE_AI_API_KEY` | GitHub repo secret (optional failover) | Not yet |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel env vars | Done (existing) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel env vars | Done (existing) |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env vars | Done (existing) |
| `ANTHROPIC_API_KEY` | Vercel env vars | Done (existing) |
| `blog_subscribers` table | Supabase | Done (2026-04-16) |
| GitHub Actions workflow permissions | Read and write | Done (2026-04-17) |

---

## Files Created

| File | Purpose |
|------|---------|
| `lib/blog.ts` | MDX parsing, post retrieval, series reading, upcoming posts, related posts |
| `lib/blog-persona.ts` | Kira persona + system prompt (data, references, SEO, internal linking, format rules) |
| `app/blog/page.tsx` | Blog index with Kira intro, series filters, Coming Next teasers, subscribe CTA |
| `app/blog/[slug]/page.tsx` | Individual post: MDX render, series nav, share buttons, social snippets, author bio, related posts, JSON-LD |
| `app/blog/[slug]/social-snippets.tsx` | Multi-platform social snippet card with tabbed UI + copy button (client component) |
| `app/blog/[slug]/share-buttons.tsx` | Modern share: copy link, native share, X, LinkedIn (client component) |
| `app/blog/series/[slug]/page.tsx` | Series overview with progress bar and published/upcoming TOC |
| `app/blog/subscribe-form.tsx` | Email subscription form (client component) |
| `app/blog/rss.xml/route.ts` | RSS 2.0 feed with all published posts |
| `app/api/blog/subscribe/route.ts` | Subscription API → Supabase blog_subscribers table |
| `scripts/blog-pipeline.mjs` | 8-step pipeline: research, generate, fact-check, plagiarism, links, quality, social, meta. 4-provider failover. Email notifications. |
| `.github/workflows/blog-prepare.yml` | Prepare cron: Mon/Thu 9am UTC. Uses PAT_TOKEN for git push. |
| `.github/workflows/blog-publish.yml` | Publish cron: Tue/Fri 9am UTC. Uses PAT_TOKEN for git push. With same-day fallback. |
| `content/series/ai-content-creation.json` | Series blueprint: 6 posts with keywords + formats |
| `content/series/ai-for-small-business.json` | Series blueprint: 8 posts with keywords + formats |
| `content/series/understanding-ai.json` | Series blueprint: 6 posts with keywords + formats |
| `content/blog/*.mdx` | Blog posts (pipeline-generated, committed by Kira) |
| `content/blog/_pipeline-log.json` | Pipeline execution log with full attempt details |

## Files Modified

| File | Change |
|------|--------|
| `package.json` | Added 6 deps (next-mdx-remote, gray-matter, reading-time, openai, @google/generative-ai, resend) + 1 dev dep (@tailwindcss/typography) |
| `tailwind.config.ts` | Added typography plugin + `content/**/*.mdx` content path |
| `app/page.tsx` | Added Blog link to landing page header nav |
| `app/dashboard/page.tsx` | Added Blog link to dashboard header (logged-in state) |
| `app/layout.tsx` | Added RSS auto-discovery `<link>` tag, favicon, apple-touch-icon |
| `app/sitemap.ts` | Added dynamic blog post + series entries |
| `.env.example` | Added notes for OPENAI_API_KEY, GOOGLE_AI_API_KEY |

---

## Issues Resolved During Go-Live

1. **Missing dependencies after rebase** - Package.json conflict resolution during rebase kept remote's version without new blog dependencies. Fixed by manually re-adding all 7 dependencies.
2. **Vercel security check** - next-mdx-remote v5 flagged as vulnerable. Upgraded to v6.
3. **GitHub Actions push permission denied** - Default GITHUB_TOKEN lacked write access. Created fine-grained PAT (`PAT_TOKEN`) with Contents + Workflows read/write on klinchapp repo.
4. **Blog link missing in logged-in state** - Dashboard header didn't have Blog link. Added to `app/dashboard/page.tsx`.

---

## Automated Schedule (Live)

| Day | Time (UTC) | Action | Status |
|-----|-----------|--------|--------|
| Monday | 9:00 AM | Prepare post (research + write + verify) | Automated |
| Tuesday | 9:00 AM | Publish post (go live + email notification) | Automated |
| Thursday | 9:00 AM | Prepare post (research + write + verify) | Automated |
| Friday | 9:00 AM | Publish post (go live + email notification) | Automated |

---

## Operational Improvements (2026-04-27)

A focused work session that started with a Search Console "Duplicate without user-selected canonical" warning and expanded into a full hardening of the production environment around the autonomous blog engine. See `Regression-Strategy.md` for the strategy doc and `Blog-Audio-Video-Research.md` for the parked audio/video discovery work.

### Changes deployed

| Area | Change | Status |
|---|---|---|
| SEO | Server-component split for `/` and `/login` so `<link rel="canonical">` and `robots: noindex` can be exported | Live |
| SEO | `/login` removed from `app/sitemap.ts` (login pages should not be indexed) | Live |
| Routing | New `middleware.ts` redirects `*.vercel.app` → `www.klinchapp.com` (production env only; preview deploys preserved for testing) | Live |
| Vercel | Orphan duplicate Vercel project (`klinchapp` → `klinchapp.vercel.app`) deleted — was double-building every push and exposing duplicate-content URL to Google | Live |
| Vercel | `vercel.json` `ignoreCommand` skips deploys for `regression-reports/`-only commits | Live |
| GitHub | Branch protection ruleset on `main` — require PR + status check, block force pushes, admin bypass for bot commits (Kira, Klinchapp CI) | Live |
| CI | Phase 1 regression infrastructure: `Build & Type Check` required on every PR | Live |
| CI | `regression-on-main` workflow: triggers on push to main (excluding `regression-reports/**`), daily 03:00 UTC, and manual dispatch | Live |
| Audit trail | Every regression run writes a Markdown report committed to `regression-reports/` as `Klinchapp CI <klinchapp.info@gmail.com>`; `INDEX.md` auto-updated | Live |
| Node version | Vercel + local on Node 24, all GitHub Actions workflows on Node 20 | Live |

### Incident resolved during go-live

**Self-triggering workflow loop (P1)** — within minutes of regression infrastructure going live, `regression-on-main` recursed on its own commits for ~37 iterations over 30 minutes (the workflow pushed regression reports to `main`, which re-fired the workflow). Caught manually by observing Vercel queue. Fixed in commit `b81c121` by adding `paths-ignore: ['regression-reports/**']` to the workflow trigger; reinforced with `vercel.json` `ignoreCommand` as defense in depth. Full incident write-up in `Regression-Strategy.md` → "Incidents & Lessons".

The audit trail itself helped catch and diagnose this — the recursion was immediately visible in `git log`. The reporting design that protects the system also helped expose its first failure.

### Phase status (regression strategy)

| Phase | Status | Trigger to next |
|---|---|---|
| Phase 1 — Pre-merge build & typecheck | **Live** | — |
| Phase 2 — Critical-path smoke tests | Planned | Before paid traffic OR audio/video pilot launch |
| Phase 3 — Synthetic monitoring | Planned | Before publishing subscribe form widely |
| Phase 4 — Subscriber-path canary | Planned | After first 10 subscribers |
| Phase 5 — Branch protection + reviews | Partial — protection live, reviews deferred | When >1 dev contributes |

### Files added

| File | Purpose |
|---|---|
| `middleware.ts` | Production-only redirect of `*.vercel.app` → `www.klinchapp.com` |
| `app/home-client.tsx` | Extracted client logic from `/` so `page.tsx` can export metadata server-side |
| `app/login/login-client.tsx` | Same pattern for `/login` |
| `.github/workflows/ci.yml` | Pre-merge build + typecheck on PRs |
| `.github/workflows/regression-on-main.yml` | Post-merge + scheduled regression with audit-trail commit |
| `scripts/write-regression-report.mjs` | Generates per-run Markdown report and updates `INDEX.md` |
| `regression-reports/INDEX.md` | Auto-updated reverse-chronological index of all regression runs |
| `New Functionality/Regression-Strategy.md` | 5-phase regression strategy, risk model, audit-trail spec, incident log |
| `New Functionality/Blog-Audio-Video-Research.md` | Discovery doc for parked audio/video distribution work |

### Files modified

| File | Change |
|---|---|
| `app/page.tsx` | Server-component wrapper with canonical metadata; renders `home-client.tsx` |
| `app/login/page.tsx` | Server-component wrapper with canonical + `robots: noindex`; renders `login-client.tsx` |
| `app/sitemap.ts` | Removed `/login` entry |
| `vercel.json` | Added `ignoreCommand` for regression-reports-only commits |

### Steady-state behaviour after this session

- Every PR runs `Build & Type Check` (~3-5 min) before merge is allowed
- Every push to `main` (except regression-reports/-only) triggers regression → produces an audit report
- Daily 03:00 UTC scheduled regression run produces a heartbeat report → no Vercel build (ignoreCommand)
- Regression-only commits trigger zero workflows AND zero Vercel builds (two-layer protection)
- Manual regression run available via Actions UI for ad-hoc verification

### Cost impact

Negligible additional ongoing cost beyond the existing $0.25/mo blog pipeline:
- GitHub Actions: ~3-5 min per PR + ~50s per regression run (well within free tier)
- Vercel: regression-only commits skipped via ignoreCommand → zero added build minutes in steady state
- One-time spike on 2026-04-27 from the loop incident: ~37 wasted Vercel builds (recovered)

### Cross-references

- Strategy + risk model + incident log → `New Functionality/Regression-Strategy.md`
- Parked work (audio/video distribution research) → `New Functionality/Blog-Audio-Video-Research.md`
- Live audit trail → `regression-reports/INDEX.md`

---

## Deferred Items (Future Phases)

| Item | Description | Trigger to Start |
|------|-------------|------------------|
| Featured images (DALL-E) | AI-generated hero image per post (~$0.50/mo) | After 10+ posts live |
| "Week in AI" roundup | Monthly standalone roundup post | Add blueprint entry when ready |
| Health check alerts | Alert if no post published for 5+ days | Add GitHub Action |
| Social API automation | Auto-post to X, LinkedIn via Buffer/X API | When manual copy-paste is tedious |
| Analytics feedback loop | GA4 data into topic selection | After 1,000+ monthly visitors |
| Social listening | Monitor mentions, AI-generated replies | After social presence established |
| Monthly auto-planning | Auto-generate new series blueprints from AI news trends | After current 20 topics used (~10 weeks) |
| AI Content Engine as Product | Multi-tenant pipeline for other businesses | After proving on klinchapp.com |
