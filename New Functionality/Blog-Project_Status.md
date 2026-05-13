# Klinchapp Autonomous AI Blog Engine - Project Status

**Project:** Autonomous AI Blog Engine for klinchapp.com
**PRD:** [klinchapp_ai_blog_prd.pdf](./klinchapp_ai_blog_prd.pdf)
**Start Date:** 2026-04-16
**Go-Live Date:** 2026-04-17
**Status:** LIVE - Fully Autonomous
**First Post:** [AI-Generated Content: Why Quality Beats Quantity Every Time](https://www.klinchapp.com/blog/ai-content-quality-over-quantity)
**GitHub PRs:**
- [#1 - Autonomous AI Blog Engine](https://github.com/Klinchapp/klinchapp/pull/1) (merged 2026-04-17)
- [#17 - Auto-syndicate Kira posts to Blogger via API](https://github.com/Klinchapp/klinchapp/pull/17) (merged 2026-05-10)
- [#18 - Auto-syndicate Kira posts to WordPress.com via API](https://github.com/Klinchapp/klinchapp/pull/18) (merged 2026-05-12)
- [#19 - Tighter Kira blog posts (700-900 words) + smaller italicized References](https://github.com/Klinchapp/klinchapp/pull/19) (merged 2026-05-12)
- [#20 - AI for Recruitment series blueprint (7 posts)](https://github.com/Klinchapp/klinchapp/pull/20) (merged 2026-05-12)
- [#21 - Stronger social snippet prompts (engagement CTAs, value-in-caption, mixed hashtags)](https://github.com/Klinchapp/klinchapp/pull/21) (merged 2026-05-12)

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

### Phase 6: External Syndication (Blogger) - COMPLETE 2026-05-10

Goal: every published Kira post auto-syndicates to a free external blog (Blogger) for backlink diversification, with no third-party SaaS in the link path.

- [x] **6.1** Tried IFTTT (RSS → Blogger). Abandoned — Pro paywall on the Blogger trigger and the URL-shortener override was buried.
- [x] **6.2** Tried dlvr.it (RSS → Blogger). Worked technically but defaulted to `dlvr.it/xxx` shortlinks instead of direct backlinks; the shortener-disable setting was inaccessible. Setup deactivated 2026-05-10.
- [x] **6.3** Pivoted to direct Blogger API call from GitHub Actions — full control, version-controlled, no SaaS in the link path.
- [x] **6.4** New script `scripts/syndicate-to-blogger.mjs`: reads latest published MDX, extracts ~3 paragraph teaser, OAuth refresh → Blogger API v3 POST.
- [x] **6.5** New workflow step `Syndicate to Blogger` added to `.github/workflows/blog-publish.yml`. Gated on `if: steps.commit.outputs.published == 'true'` and uses `continue-on-error: true` so a syndication failure cannot break the publish flow.
- [x] **6.6** Setup doc at `scripts/BLOGGER_API_SETUP.md` (Google Cloud OAuth dance + 4 GitHub secrets).
- [x] **6.7** OAuth setup completed in existing `Klinchapp` Google Cloud project (Blogger API enabled, scope added under OAuth consent → Data Access, test user added under Audience).
- [x] **6.8** Four GitHub secrets added: `BLOGGER_CLIENT_ID`, `BLOGGER_CLIENT_SECRET`, `BLOGGER_REFRESH_TOKEN`, `BLOGGER_BLOG_ID`.
- [x] **6.9** Security review run on PR #17 — no high-confidence findings. Hardcoded Google endpoints, OAuth via standard refresh_token flow, all inputs trusted (env vars + own MDX content).
- [x] **6.10** PR #17 merged (commit `409cb92`).
- [x] **6.11** End-to-end test: post `ai-prompts-for-business` syndicated successfully → https://klinchapp.blogspot.com/2026/05/how-to-write-ai-prompts-that-actually.html. Direct klinchapp.com link in body, ~3-paragraph teaser, "by Kira" footer.

### Phase 7: External Syndication (WordPress.com) - COMPLETE 2026-05-12

Goal: second free backlink destination at `kirasaiblog.wordpress.com`, mirroring the Blogger approach. Diversifies the backlink source domain (different root domain than blogspot.com).

- [x] **7.1** New script `scripts/syndicate-to-wordpress.mjs` — same shape as Blogger script: reads latest published MDX, extracts ~3 paragraph teaser, POSTs to `public-api.wordpress.com/rest/v1.1/sites/{site}/posts/new` with Bearer auth.
- [x] **7.2** Auth simpler than Blogger: WordPress.com issues long-lived access tokens via password grant (`grant_type=password`) using an Application Password — no refresh dance, no token expiry. Only 2 secrets at runtime vs Blogger's 4.
- [x] **7.3** New workflow step `Syndicate to WordPress` added to `.github/workflows/blog-publish.yml`. Runs after the Blogger step. Same gating (`if: published == 'true'`) and same safety (`continue-on-error: true`).
- [x] **7.4** Setup doc at `scripts/WORDPRESS_API_SETUP.md` (app registration at developer.wordpress.com, Application Password generation, token mint via PowerShell `Invoke-RestMethod` or curl, 2 GitHub secrets).
- [x] **7.5** App registered at developer.wordpress.com as `klinchapp-syndicator`. Redirect URL set to `https://www.klinchapp.com/` (WP.com rejects redirect URLs containing the word "wordpress").
- [x] **7.6** 2FA enabled on the Klinchapp WP.com account (required for Application Passwords). Application Password generated and used once to mint the access token, then discarded.
- [x] **7.7** Two GitHub secrets added: `WORDPRESS_ACCESS_TOKEN`, `WORDPRESS_SITE_ID` (set to `kirasaiblog.wordpress.com`).
- [x] **7.8** Security review run on PR #18 — no high-confidence findings. Identical security profile to PR #17 (hardcoded WP.com endpoint, bearer auth, `encodeURIComponent` on site ID).
- [x] **7.9** End-to-end test: workflow run on `feat-wordpress-syndication` branch syndicated successfully to both Blogger AND WordPress.com simultaneously. Confirmed posts visible on both `klinchapp.blogspot.com` and `kirasaiblog.wordpress.com`.

### Phase 8: Post-launch Tuning - COMPLETE 2026-05-12

Goal: refine the live blog based on reader-feedback and engagement data — tighter posts, better social snippets, cleaner References styling. Plus a new series queued for autonomous publishing.

- [x] **8.1** Word count reduced from **800-1200 → 700-900** in both `lib/blog-persona.ts` (system prompt) and `scripts/blog-pipeline.mjs` (per-post user prompt). Driven by external feedback that current posts felt long for 2026 reading patterns. Tighter posts have better completion rates without losing SEO depth (PR #19).
- [x] **8.2** References section styled smaller + italic + muted grey for aesthetic. Added `blog-content` class to MDX wrapper in `app/blog/[slug]/page.tsx` and a CSS rule in `app/globals.css` that targets the last h2 (which is always References per Kira's prompt) and following siblings (PR #19).
- [x] **8.3** Social snippet prompts strengthened across all 5 platforms in `scripts/blog-pipeline.mjs:491-516` (PR #21):
  - X/Twitter: lead with question/contrarian hook (optimised for replies, not RTs)
  - LinkedIn: 4-5 paragraphs (was 2-3), in-caption value, closing question to drive comments
  - Instagram: in-caption tip (not just tease), save/comment/tag CTA, 8-12 mixed-volume hashtags (broad + medium-niche + small-niche)
  - Facebook: opens with question, in-caption takeaway
  - TikTok: clarified captions are hooks for video, not summaries
- [x] **8.4** New 7-post series **AI for Recruitment** queued via `content/series/ai-recruitment.json` (PR #20). Slots alphabetically after `ai-for-small-business` and before `understanding-ai` — first post lands ~2026-05-26. Series covers AI in recruiting (sourcing, screening, interview tools, scheduling) plus candidate-side (AI resume builders) plus a bridging opinion piece. Designed to ride LinkedIn momentum on the AI-in-hiring topic.

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
        → Syndicate to Blogger (NEW 2026-05-10)
            • Read latest published MDX
            • Extract ~3 paragraph teaser + canonical klinchapp.com link
            • OAuth refresh → POST to Blogger API v3
            • continue-on-error: true (cannot break publish)
        → Syndicate to WordPress (NEW 2026-05-12)
            • Same teaser + canonical link-back as Blogger
            • Long-lived Bearer token → POST to WordPress.com REST API v1.1
            • continue-on-error: true (cannot break publish or Blogger step)
```

**LLM Failover Chain (3 attempts each: immediate → 5 min → 10 min):**
1. Claude Haiku 4.5 (~$0.02/post) - primary
2. Claude Sonnet 4 (~$0.06/post) - same SDK, better quality
3. OpenAI GPT-4o mini (~$0.01/post) - different provider entirely
4. Google Gemini Flash (~$0.01/post) - third provider
- Worst case: ~60 minutes across all 12 attempts before giving up

---

## Series Blueprints

| Series | Posts | Topics | Status (as of 2026-05-13) |
|--------|-------|--------|--------|
| AI Content Creation: The Complete Playbook | 6 | Quality vs quantity, training AI on your style, blog writing workflow, social media platforms, ethics, future of AI content | All 6 published |
| AI for Small Business: A Practical Guide | 8 | Where to start, 5 tools, prompts, chatbots, social media, costs, mistakes, 30-day plan | 4 published, 4 pending |
| AI for Recruitment: What's Actually Changing | 7 | Recruiter stack, AI resume screening, candidate sourcing, interview tools, scheduling, AI resume builders for candidates, AI-replacing-recruiters debate | All pending — runs after Small Business series (~2026-05-26 onwards) |
| Understanding AI: From Zero to Informed | 6 | What is AI, ChatGPT vs Claude vs Gemini, how AI learns, hallucinations, ethics, AI literacy | All pending |
| **Total** | **27** | | **10 published, 17 pending** |

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
| `BLOGGER_CLIENT_ID` | GitHub repo secret (Blogger syndication OAuth) | Done (2026-05-10) |
| `BLOGGER_CLIENT_SECRET` | GitHub repo secret (Blogger syndication OAuth) | Done (2026-05-10) |
| `BLOGGER_REFRESH_TOKEN` | GitHub repo secret (Blogger syndication OAuth) | Done (2026-05-10) |
| `BLOGGER_BLOG_ID` | GitHub repo secret (target Blogger blog ID) | Done (2026-05-10) |
| Google Cloud project `Klinchapp` | Blogger API v3 enabled, OAuth client `klinchapp-syndicator` | Done (2026-05-10) |
| `WORDPRESS_ACCESS_TOKEN` | GitHub repo secret (long-lived Bearer for WP.com REST API) | Done (2026-05-12) |
| `WORDPRESS_SITE_ID` | GitHub repo secret (target WP.com blog domain `kirasaiblog.wordpress.com`) | Done (2026-05-12) |
| WordPress.com app `klinchapp-syndicator` | Registered at developer.wordpress.com/apps. 2FA enabled on account. | Done (2026-05-12) |

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
| `scripts/syndicate-to-blogger.mjs` | Blogger API v3 syndication: reads latest published MDX, builds 3-paragraph HTML teaser + canonical link-back, OAuth refresh → POST. Added 2026-05-10. |
| `scripts/BLOGGER_API_SETUP.md` | One-time OAuth setup guide (Google Cloud project, Blogger API enable, OAuth consent + scopes, OAuth Playground for refresh token, GitHub secrets). Added 2026-05-10. |
| `scripts/syndicate-to-wordpress.mjs` | WordPress.com REST API v1.1 syndication: same MDX → 3-paragraph teaser pipeline, Bearer auth, posts to `kirasaiblog.wordpress.com`. Added 2026-05-12. |
| `scripts/WORDPRESS_API_SETUP.md` | One-time setup guide (developer.wordpress.com app, Application Password, password-grant token mint, GitHub secrets). Added 2026-05-12. |
| `content/series/ai-recruitment.json` | Series blueprint: 7-post AI for Recruitment series (recruiter-side + candidate-side + bridging opinion). Added 2026-05-12. |

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
| `.github/workflows/blog-publish.yml` | Added `Syndicate to Blogger` step after publish (2026-05-10) and `Syndicate to WordPress` step (2026-05-12). Both gated on `published == 'true'`, both `continue-on-error: true`. |
| `lib/blog-persona.ts` | Word count target reduced from 800-1200 to 700-900 (2026-05-12, PR #19). |
| `scripts/blog-pipeline.mjs` | Word count target reduced to 700-900 (PR #19); social snippet prompts strengthened across all 5 platforms — engagement CTAs, value-in-caption, mixed-volume hashtags (PR #21). Both 2026-05-12. |
| `app/blog/[slug]/page.tsx` | Added `blog-content` CSS class to MDX wrapper to enable References-section styling (2026-05-12, PR #19). |
| `app/globals.css` | Added CSS rule targeting last h2 in `.blog-content` and following siblings — renders References section smaller, italic, muted grey (2026-05-12, PR #19). |

---

## Issues Resolved During Go-Live

1. **Missing dependencies after rebase** - Package.json conflict resolution during rebase kept remote's version without new blog dependencies. Fixed by manually re-adding all 7 dependencies.
2. **Vercel security check** - next-mdx-remote v5 flagged as vulnerable. Upgraded to v6.
3. **GitHub Actions push permission denied** - Default GITHUB_TOKEN lacked write access. Created fine-grained PAT (`PAT_TOKEN`) with Contents + Workflows read/write on klinchapp repo.
4. **Blog link missing in logged-in state** - Dashboard header didn't have Blog link. Added to `app/dashboard/page.tsx`.

## Issues Resolved During Blogger Syndication (2026-05-10)

1. **IFTTT Pro paywall** - The Blogger trigger required Pro tier and the UI funneled into payment without a free-tier escape. Abandoned.
2. **dlvr.it shortlinks** - dlvr.it's free tier defaults to posting `dlvr.it/xxx` shortlinks instead of direct klinchapp.com links, undermining the entire backlink play. Per-route override appeared locked behind global account settings that the UI made hard to reach. Abandoned and deactivated 2026-05-10.
3. **Approach pivot** - Switched from third-party SaaS to a direct Blogger API call from GitHub Actions. Removes the SaaS link path entirely; full control over post body and outbound URLs.
4. **Google Cloud OAuth UI reorg** - "Edit App" / Scopes flow has moved into separate sub-tabs (Data Access, Audience, Clients) under the new Google Auth Platform UI. Updated setup doc steps to match.

## Issues Resolved During WordPress.com Syndication (2026-05-12)

1. **Redirect URL rejection** - developer.wordpress.com rejects any redirect URL containing the word "wordpress". Worked around by using `https://www.klinchapp.com/` instead. The redirect URL is irrelevant for password-grant auth anyway, but the field is required.
2. **2FA prerequisite for Application Passwords** - WP.com requires two-step authentication to be enabled before Application Passwords can be generated. Set up authenticator-app 2FA on the Klinchapp WP.com account.
3. **Google-login account confusion** - The Klinchapp WP.com account signs in via Google OAuth, not native password. Resolved: Application Passwords are independent of the underlying sign-in method, and the OAuth password-grant username can be the Google email address.
4. **PowerShell hides 400-error response body by default** - When the OAuth token mint failed, `Invoke-RestMethod` showed only "Bad Request" without the actual error JSON. Added try/catch with `StreamReader` workaround to the setup doc for diagnosis.
5. **`grant_type=password` is a literal string, not the user's password** - Naming collision in OAuth 2.0 spec. Clarified in the setup doc.

---

## Automated Schedule (Live)

| Day | Time (UTC) | Action | Status |
|-----|-----------|--------|--------|
| Monday | 9:00 AM | Prepare post (research + write + verify) | Automated |
| Tuesday | 9:00 AM | Publish post (go live + email notification + syndicate to Blogger + WordPress.com) | Automated |
| Thursday | 9:00 AM | Prepare post (research + write + verify) | Automated |
| Friday | 9:00 AM | Publish post (go live + email notification + syndicate to Blogger + WordPress.com) | Automated |

---

## Deferred Items (Future Phases)

| Item | Description | Trigger to Start |
|------|-------------|------------------|
| Featured images (DALL-E) | AI-generated hero image per post (~$0.50/mo) | After 10+ posts live |
| "Week in AI" roundup | Monthly standalone roundup post | Add blueprint entry when ready |
| Health check alerts | Alert if no post published for 5+ days | Add GitHub Action |
| Backfill existing Kira posts to Blogger + WordPress | One-off script to POST the already-published MDX posts to both destinations so it's not just future posts | Low priority — new posts are what matter for backlink momentum |
| Bump GitHub Actions runner versions | `actions/checkout@v4` and `actions/setup-node@v4` warned as Node 20 deprecated (forced to Node 24 from June 2026, removed Sep 2026) | Before June 2026 |
| Third backlink destination (Tumblr?) | Same pattern as Blogger/WP. Skipped initially — only add if Blogger+WP underperform on Search Console after a few weeks. | Only if needed |
| Social API automation | Auto-post to X, LinkedIn via Buffer/X API | When manual copy-paste is tedious. Note: blog-to-Blogger + blog-to-WordPress syndication shipped 2026-05-10 to 2026-05-12 (separate from social platforms) |
| WordPress.com auto-syndication | Mirror of Blogger syndication for a second free backlink source | Done — see Phase 7 |
| Analytics feedback loop | GA4 data into topic selection | After 1,000+ monthly visitors |
| Social listening | Monitor mentions, AI-generated replies | After social presence established |
| Monthly auto-planning | Auto-generate new series blueprints from AI news trends | After current 20 topics used (~10 weeks) |
| AI Content Engine as Product | Multi-tenant pipeline for other businesses | After proving on klinchapp.com |
