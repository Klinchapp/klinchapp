# SEO Action Plan — Synthesis & Sequencing

**Status:** Decision document, not a project plan
**Created:** 2026-04-30
**Source material:** `Klinchapp_SEO_Analysis_Wren.pdf`, `Klinchapp_SEO_Analysis_Report - Claude.pdf`, `Klinchapp SEO Analysis and Recomendatiosns - Gemini.pdf` (all in this folder)

---

## Why this doc exists

Three independent LLM-driven SEO audits (Wren, Claude, Gemini) of klinchapp.com produced reports in the April 24–30 window. Pattern recognition: where they converge, the signal is real; where they diverge or fabricate, ignore. This doc absorbs what's load-bearing for klinchapp specifically and sequences it against current site state.

This is the "what to do, in what order" doc — not a how-to, and not a commitment to do all of it. Items marked **Deferred** explicitly stay deferred until a clear trigger.

---

## Current site state (verified, not assumed)

Before acting on any recommendation, here's what's actually in the codebase as of this writing:

| Area | State |
|------|-------|
| Rendering — `<head>` | Server-rendered on all routes. Title, meta, canonical, OG all present in SSR'd HTML. |
| Rendering — homepage `<body>` | **Was gated behind a client-side auth-check loader** (SSR'd HTML was just a spinner — H1, hero, features all hidden from crawlers). Fixed 2026-04-30 by moving auth check to background; marketing content now in SSR. The Claude report's "near-empty HTML shell" finding was correct on this. |
| `robots.txt` | Present via `app/robots.ts`. Allows `/`, disallows `/api`, `/dashboard`, `/auth`. References sitemap. |
| `sitemap.xml` | Present via `app/sitemap.ts`. |
| Canonicals | Present on `/` and `/login` (`alternates.canonical`). |
| Title tag | `"Klinchapp - AI-Powered Social Media Post Creator"` — has primary keyword, decent. |
| Meta description | Present in `app/layout.tsx`. Reasonable length, contains keyword + benefit. |
| OpenGraph + Twitter Card | Present, with `og-image.png`. |
| Homepage H1 | Updated 2026-04-30 to `"AI Social Media Post Generator"` (keyword-led). |
| Homepage H2s | Still generic ("Why Choose Klinchapp?", "How It Works", "Ready to Transform…"). Outstanding. |
| JSON-LD schema | `Article` on blog posts. `SoftwareApplication` + `FAQPage` on `/ai-instagram-post-generator`. Sitewide `Organization` / `WebSite` still missing. |
| Image alt text | Inconsistent — needs audit. |
| Blog | Live, autonomous (Kira), 2-stage publish, Article schema present. |
| Platform pages (`/ai-X-post-generator`) | **Instagram in flight (V1) on branch `feat-platform-page-instagram`** — full SSR, schema, FAQ, sample post mocks. LinkedIn / X / Facebook / TikTok deferred until Instagram has data. |
| Use Cases / `/for-X` pages | Not built. Scoped in `Use-Cases-Track-Research.md`. **Reprioritized behind platform pages** — see decision log below. |
| Comparison pages (`/vs/X`) | Not built. |
| Free tools | Not built. |
| Search Console / Bing Webmaster | Setup status unverified — assume needs work. |

This table is the baseline. Anything below this is gap-closing, not greenfield.

---

## Convergent signal across the three reports

These items appeared in all three (or in two reports with no contradiction). They are the load-bearing recommendations.

### 1. JSON-LD structured data
Add schema beyond what we have on blog posts. Specifically:
- `Organization` (sitewide, in `app/layout.tsx`) — name, url, logo, sameAs links to social profiles
- `WebSite` (sitewide) — with optional `SearchAction` if we want sitelinks search box
- `SoftwareApplication` (homepage only) — name, applicationCategory, operatingSystem, offers (price 0 / free tier), description, screenshot, featureList
- **Skip**: `aggregateRating`, `Review` — these need real review data. Faking is fraud Google penalizes.
- **Add later**: `FAQPage` once a real FAQ section exists on the homepage; `BreadcrumbList` once Use Cases sub-pages exist; `aggregateRating` once we have real third-party reviews (G2, Capterra, Product Hunt).

### 2. H1 / H2 keyword alignment
Current homepage H1 is brand-led with no keyword signal. All three reports flagged this.
- **H1 rewrite**: lead with primary keyword. Two viable options:
  - Eyebrow `"AI Social Media Post Generator"` above existing `"Create Stunning Social Posts in Seconds"` (keeps brand voice + adds keyword as the SEO-visible element)
  - Single H1: `"AI-Powered Social Media Posts in Seconds"` (more compact, slightly less brand)
- **H2 rewrites**: at least the first two H2s should contain a keyword variant. "Why Choose Klinchapp's AI?" or "How AI Generates Your Social Posts" — final CTA H2 can stay branded.
- Title tag is already decent, but could be tightened to lead with keyword: `"AI Social Media Post Generator | Klinchapp"`. A/B-able later.

### 3. Use-case / audience landing pages (`/for-X`)
All three reports recommend `/for-restaurants`, `/for-coaches`, `/for-real-estate-agents`, etc. **This already exists as a planned track** — see `New Functionality/Use-Cases-Track-Research.md`. No new work needed in this doc; that doc owns the design.

### 4. Comparison pages (`/vs/X`)
All three reports flag `/vs/canva`, `/vs/predis-ai`, `/vs/buffer`, etc. as highest-commercial-intent traffic. Mid-funnel users ready to switch.
- **Status: Deferred.** Same content-economy concerns as Use Cases (each page is a real maintenance commitment). Hold until Use Cases pages have been built and we have a process for keeping comparison pages factually current.

### 5. Search Console + Bing Webmaster Tools
Submit sitemap, monitor indexation, fix issues as they appear. Bing matters more than people think — it powers ChatGPT search, Copilot, DuckDuckGo, etc.
- Verify GSC ownership state (probably already done, given the canonical work).
- Add Bing Webmaster Tools (likely not done).

### 6. Image alt text audit
Every image (screenshots, demo images, logos) should have descriptive alt text — this is also a natural place for supporting keywords.

### 7. Directory submissions
Product Hunt, AlternativeTo, There's An AI For That, Futurepedia, Toolify, SaaSHub, etc. Cheap link-earning. Spread over weeks, not days, to look organic.

### 8. Long-tail keyword content via the blog
Kira already produces content. Recommendation is to align her topic generation with keyword research — not just generate interesting posts, but generate posts targeting specific search queries.
- Lower-effort version: post-generation, keyword-optimize titles + meta descriptions to match search intent. The body copy is already strong.
- Higher-effort version: bake keyword research into the planning prompt so Kira targets specific queries upfront.

---

## What we are explicitly not doing (and why)

- **The other four platform pages** (`/ai-linkedin-post-generator`, `/ai-twitter-post-generator`, `/ai-facebook-post-generator`, `/ai-tiktok-caption-generator`) — Instagram ships first as the experiment. The remaining four are deferred until Instagram has measurable GSC impressions/clicks. Reasoning: if the model works, scaling to the next platform is mostly a copy-and-customize. If it doesn't, we haven't built five pages we'd have to throw away.
- **Free tools (`/free-instagram-caption-generator`, etc.)** — recommended as link magnets. High-leverage, but each is a real product (UI, infra, abuse protection, attribution back to paid). **Deferred** until we have a clear bandwidth window.
- **Pillar content** (3,000-word "Complete Guide" posts) — Wren-specific recommendation. Kira's existing series structure already does this organically. No separate effort needed.
- **PR / "Meet Kira" pitches** — Wren and Gemini both flag the AI-author-transparency angle. Genuinely good, but PR is a calendar-commitment activity, not a checklist item. **Deferred** until we have a launch moment to anchor it to.
- **International / hreflang** — long-term win but premature until English baseline is producing measurable organic traffic.

---

## Sequencing

### Now (cheap wins, no scope-creep)
| Item | Where | Effort |
|------|-------|--------|
| `Organization` + `WebSite` JSON-LD | `app/layout.tsx` | ~30 min |
| `SoftwareApplication` JSON-LD | `app/page.tsx` (or component imported in) | ~30 min |
| H1 rewrite with keyword | `app/home-client.tsx:67` | ~10 min + design eye |
| H2 rewrites for first two H2s | `app/home-client.tsx:87, 107` | ~10 min |
| Title tag tightening (optional, A/B) | `app/layout.tsx:10` | ~5 min |
| Bing Webmaster Tools — verify + submit sitemap | External | ~15 min |
| Search Console — confirm sitemap submitted, indexation healthy | External | ~10 min |
| Image alt text audit | `app/home-client.tsx`, blog templates | ~30–60 min |

Sum: roughly half a day if batched. None of it requires new pages, new content, or design work beyond H1 framing.

### Soon (scoped elsewhere)
- Use Cases track — owned by `Use-Cases-Track-Research.md`
- Directory submissions — drip over weeks, no rush

### Deferred (don't pretend these are next)
- LinkedIn / X / Facebook / TikTok platform pages (gated on Instagram data)
- Use Cases / `/for-X` audience pages (gated on at least one platform-page validation)
- Free tools
- Comparison pages (`/vs/X`)
- `aggregateRating` schema (needs real reviews)
- Sitewide `FAQPage` schema (needs real FAQ section on homepage; the Instagram page has its own valid FAQPage schema)
- International / hreflang

---

## How this doc relates to others

| Doc | Relationship |
|-----|--------------|
| `Use-Cases-Track-Research.md` | Owns the `/use-cases` (audience landing) track. This doc defers to it. |
| `Regression-Strategy.md` | Any SEO work goes through the same regression gate. No bypassing. |
| `Blog-Project_Status.md` | Blog work (including keyword-aligned topic generation) is tracked there, not here. |

---

## Notes on the source reports

For honesty and so we don't relitigate later:
- The three reports converge on the items above, which is the real signal.
- The Claude report's headline finding — "near-empty HTML shell on the homepage" — was correct: the marketing content was gated behind a client-side auth-check loader, so SSR'd HTML for `/` was just a spinner. Initial assessment of this doc dismissed that finding; that was wrong. Fixed 2026-04-30.
- Wren is most accurate on the rest of the current site state (Kira, multi-language, blog). Gemini had product-premise drift in places. Where the reports disagree, this doc trusts what's verified in the codebase.
- Several recommendations across the reports cite metrics or examples (review counts, traffic baselines, version numbers) that the LLMs could not actually know. None of those have been carried into this plan.

## Decision log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-30 | Platform pages prioritized over Use Cases (audience) pages. Instagram first. | Differentiated content for platform pages already exists as product features. ~10× higher search volume → faster GSC signal. MVP-able with one page. Lower brand risk. |
| 2026-04-30 | Homepage SSR auth-check loader removed. | Marketing content was hidden from crawlers behind a client-side gate. Trade-off: logged-in users briefly see marketing page before redirect (~150–300ms). Standard SaaS pattern. |

---

## Trigger conditions to revisit

Re-open this doc when any of:
- A "now" item is unclear or hits a blocker
- Use Cases pages ship and we want to layer comparison pages on top
- Organic traffic baseline materially changes (good or bad) and we want to retune
- A new SEO audit produces a finding none of the existing three flagged
