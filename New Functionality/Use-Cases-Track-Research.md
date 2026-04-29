# Klinchapp Use Cases Track: Architecture & Content Strategy

**Date:** 2026-04-29
**Status:** Discovery — design captured, build deferred
**Related:**
- `Blog-Project_Status.md` (Kira / editorial track)
- `Blog-Audio-Video-Research.md` (parked audio/video distribution)
- `Regression-Strategy.md` (CI/audit-trail strategy)

---

## Premise: the site has two arms

Klinchapp's marketing site is, in effect, two distinct things sharing one domain:

1. **The product arm** — Klinchapp itself. Users sign in, upload product images, generate AI social posts. SaaS surface.
2. **The editorial arm** — Kira's autonomous AI blog. Twice-weekly posts on AI topics, fully autonomous pipeline (research → write → fact-check → plagiarism check → link validation → quality score → publish).

These two arms have **fundamentally different content economies**. They serve different jobs, run on different production rhythms, and decay at different rates. Trying to make them share a content surface dilutes both.

This document captures the thinking around adding a **third surface** — a **Use Cases track** — that demonstrates what the product does, separately from both of the above.

---

## The two existing content economies

| Track | Update cadence | Half-life of content | Content scope | Production model |
|---|---|---|---|---|
| **Kira's editorial** (`/blog`) | 2× weekly, perpetual | Short — AI topics from Jan 2026 are stale by April | Effectively infinite (always fresh topics emerging) | Autonomous pipeline (`scripts/blog-pipeline.mjs`) |
| **Product surfaces** (`/`, `/login`, `/dashboard`) | Rare — only on feature changes | Long | Fixed (it's the product) | Hand-built once, maintained on changes |

**The key insight:** Kira's content is a treadmill — it must keep producing because freshness matters in the AI commentary space. Product pages are the opposite — built once, kept current with light maintenance.

A third class of content sits between these: demonstrating what the product can do. That's what the Use Cases track is for.

---

## The Use Cases track: what it is

A **finite, mostly static** library of pages that show klinchapp's outputs across verticals, platforms, and languages. Each page takes one product context, shows the AI's interpretation, and shows the platform-specific generated outputs.

Examples of pages:
- *AI social posts for restaurants*
- *AI Instagram posts for jewelry boutiques*
- *AI LinkedIn posts for SaaS dashboards*
- *Generating posts in Arabic for Gulf retail*

### Content economy of the Use Cases track

| Property | Value |
|---|---|
| Update cadence | One-time per artifact; light maintenance only |
| Half-life | Long — "AI posts for jewelry" stays relevant for years |
| Scope | Asymptotically finite (~50 verticals × ~10 examples × ~5 languages) |
| Production model | Curated, ship-and-leave |

### Why separate from Kira's blog (the load-bearing argument)

Mixing Use Cases into `/blog` would harm both:

1. **Different mental modes for visitors.** Someone reading "What is AI literacy?" is in a different cognitive mode than someone browsing "AI posts for jewelry boutiques." The same surface forces context-switching that costs both.
2. **Different SEO signals.** Search engines reward clear topical clustering. Editorial clusters around AI topics; Use Cases cluster around vertical+platform+language combinations. Mixing dilutes both clusters.
3. **Different production rhythms.** Kira is autonomous and continuous. Use Cases are curated and bursty. Forcing them onto the same pipeline creates pressure where none should exist.
4. **Different success metrics.** Blog success = views + time-on-page + reader trust building toward eventual conversion. Use Cases success = attributed signups directly from those pages.
5. **Brand integrity for Kira.** Kira's brand is "I'm an AI, I write this blog autonomously, no human editor." That's a strong position. Inserting product marketing pages into the same surface dilutes it.

**Different decay curves + different production economies + different success metrics = different surface.**

---

## Proposed architecture

### Sitemap

```
/                          → Product landing (SaaS pitch)
/login                     → Login
/dashboard                 → App (authenticated)

/blog                      → Editorial (Kira, autonomous, perpetual)
/blog/[slug]
/blog/series/[slug]
/blog/rss.xml

/use-cases                 → NEW: Use Cases hub
/use-cases/[slug]          → NEW: Individual use case pages

/privacy
/terms
```

### Navigation

A new top-level menu item:

```
Klinchapp     |  Blog  |  Use Cases  |  Login  |  Get Started
```

Four content/action items in the header. Clean separation: `/blog` for editorial, `/use-cases` for demonstrative, `/login` and `/get-started` for product entry.

### Page structure for `/use-cases/[slug]`

Each use case page is a self-contained artifact:

- **Header:** vertical name, platform(s), language(s) covered
- **Input:** the source product image (one image)
- **AI's interpretation:** what the AI "saw" — colors, category, mood, etc.
- **Generated outputs:** 2–3 platform-specific posts (Instagram caption, LinkedIn post, TikTok caption)
- **Context paragraph:** short framing of why this vertical/platform combo matters
- **CTA:** "Try with your own product → klinchapp.com"

### `/use-cases` hub page

A browse-able grid filtered by vertical, platform, and language. Design optimized for scanning, not reading. Each card links to its full use case page.

---

## Content origination: who/what writes Use Cases

This is the most interesting open question and where the brand position matters most.

### The principle: 100% AI is the brand promise

Klinchapp's identity is "100% AI" — Kira's blog already establishes this. If Use Cases are written by humans, that breaks the consistency. So ideologically, AI-generated origination is the right approach.

### How to make Use Cases "100% AI" end-to-end

The use case page has multiple content elements; each can be AI-generated by a different mechanism:

| Element | Source | Mechanism |
|---|---|---|
| Product image (input) | AI image generation | DALL-E / Midjourney / Sora-class model — keeps the "no human asset" claim intact |
| Generated social posts (the demonstration) | **klinchapp itself** | Live klinchapp generation API, called at build time |
| AI's interpretation paragraph ("what the AI saw") | LLM | Same Claude pipeline pattern as Kira's blog |
| Vertical/platform context paragraph | Kira (or sister persona) | LLM, brand-voice-conditioned |
| Page metadata (title, description, alt-text) | LLM | Pipeline step (same as blog) |

**The deepest version of this:** klinchapp generating the demonstration content for klinchapp's marketing pages = full dogfood loop. The product creates its own marketing artifacts. That story is more compelling than "we made a marketing page."

### Production pipeline (proposed, parallel in shape to blog pipeline)

```
Use Case Pipeline (similar to scripts/blog-pipeline.mjs):

1. Pick vertical + platform + language combination (from a blueprint)
2. Generate input product image (DALL-E or equivalent) → save artifact
3. Call klinchapp generation API on the image → get social posts
4. Generate context paragraph via LLM (Kira voice or sister persona)
5. Generate "AI interpretation" paragraph via LLM
6. Quality gate (LLM-based — "would a real customer find this convincing?")
7. Generate page metadata
8. Commit MDX + image artifacts → Vercel deploys
```

This is a smaller pipeline than Kira's (no research step, no fact-check, no plagiarism check — those don't apply to use case content). But same architectural philosophy: autonomous, audit-trailed, quality-gated.

### Alternative: hand-curated v1 → automated v2

If the AI pipeline is too much to build upfront, a viable middle path:

- **v1 (hand-curated):** human picks vertical, runs klinchapp manually, captures outputs into MDX. Slower per artifact but no engineering work. ~30 min per use case. Ship 10–15 use cases this way to validate the format.
- **v2 (automated):** if v1 demonstrates traction, build the pipeline above to scale. Same trigger logic as the regression strategy's phase-by-phase build-out.

The "100% AI" purity matters less in v1 if the pipeline is genuinely on the roadmap. v2 closes the loop.

### The image question is the load-bearing one

The cleanest version of "100% AI" has every single asset on the page generated by AI, including the product photo. Three options:

1. **AI-generated product images.** Keeps brand consistency. Risk: AI-generated product images sometimes look uncanny/wrong, which would undermine the demonstration.
2. **Stock photography.** Doesn't break "100% AI" since the *output* is what's being demonstrated, but introduces a non-AI asset onto pages claiming AI authorship.
3. **Real customer products** (when customers exist). Best long-term, but requires customer cooperation.

Worth experimenting with option 1 first — image generation is good enough in 2026 that minimalist product shots (a watch on a marble surface, a coffee cup, a plant in a pot) are achievable with reasonable consistency.

---

## Quality gate (critical)

Use Cases are public demonstrations. Bad outputs are worse than no outputs — they actively damage credibility.

The pipeline should refuse to publish a use case where:
- The generated social posts are generic, contain factual errors, or don't match the product
- The AI-interpretation paragraph is misaligned with the actual visual
- Any text contains AI-tells that signal "low effort" (filler phrases, generic adjectives)

LLM-based quality gate — same pattern as Kira's blog quality score — with threshold and retry logic. If quality fails twice, mark as draft and skip publication.

This is non-negotiable. The whole point of demonstrative content is that it convinces; weak outputs convince in the wrong direction.

---

## Vertical selection — which industries to target first

Not all verticals are equal. The first 3–5 set the tone for the entire library.

### High klinchapp-fit + high search intent

- **Restaurants / cafés** — high social posting cadence, photogenic, low marketing budget
- **Boutiques (clothing/fashion)** — catalog-heavy, frequent new arrivals
- **Beauty / cosmetics** — visual product, daily content needs
- **Home decor / furniture** — high AOV, benefits from professional captions
- **Jewelry** — typically photographed against clean backgrounds (matches AI workflow)

### Medium fit (revisit after first batch)

- Fitness studios, salons, real estate, food brands, gyms

### Skip

- **Agencies** — competes with klinchapp's own value prop
- **B2B SaaS** — klinchapp's outputs may not fit B2B tone yet (worth re-testing after first batch)
- **Highly regulated industries** (financial, medical) — caption errors carry compliance risk

**Starter set proposal:** 5 verticals × 3 examples each = 15 use cases for v1.

---

## Trigger conditions to start building

The Use Cases track is parked until one of these conditions fires (matching the discipline established in `Regression-Strategy.md`):

1. **Blog traffic establishes a baseline that informs vertical selection.** Search Console data after 60–90 days of Kira running will show which verticals are pulling search traffic. Build use cases for those verticals first — they have validated demand.
2. **klinchapp's own output quality is gut-checked as good enough.** Run klinchapp on 5–10 real product photos across verticals. If outputs are crisp and on-brand, the gallery is an asset. If outputs are inconsistent, it's a credibility liability — fix the product first.
3. **Paid acquisition is on the near-term roadmap.** Use Cases / vertical landing pages are conversion infrastructure. Build them when there's traffic to convert, not before.
4. **Product-strategy alignment** — confirm klinchapp's positioning is "AI social post creator for SMBs across verticals" and not pivoting elsewhere. Building 30 vertical pages around a positioning that changes is wasted work.

None of these are firing today (2026-04-29). The right answer is: design captured, build deferred, revisit when triggers fire.

---

## Open decisions (for when build is triggered)

1. **Name of the surface.** "Use Cases" matches B2B convention. "Examples" is more user-friendly. "Showcase" is more visual-marketing. Pick one and commit.
2. **Hand-curated v1 or AI pipeline v1?** Time-to-ship vs end-to-end consistency. Default lean: hand-curated v1 to validate the format, then build the pipeline if it works.
3. **Image source for v1.** AI-generated, stock, or hybrid? Worth a small experiment before committing.
4. **Where the surface sits visually.** Top-nav menu item vs footer link vs both? Top-nav matches the "third major surface" framing.
5. **Cross-linking strategy.** Should Kira's blog posts internally link to relevant use cases ("see the AI handle a coffee shop here →")? Powerful if yes, but tightens coupling between the two arms.
6. **Persona on use case pages.** Use Kira as the byline, or introduce a sister persona (e.g., a "Klinchapp Demo" voice) to keep editorial Kira clean? Brand decision.

---

## Steady-state behaviour (once built)

If/when this track ships:

- `/use-cases` becomes a separate growth lever with its own SEO surface
- Updates rare — most use case pages sit static for months/years
- Light per-month maintenance (~1 hour) to add new use cases as verticals expand
- Kira's blog continues unchanged on its 2×/week cadence, completely independent
- Cross-linking from blog to use cases optional, kept light, only where genuinely relevant

The two tracks compound rather than compete: editorial builds authority on AI topics, demonstrative converts intent on vertical queries.

---

## Strategic positioning: the "100% AI" story

Klinchapp's broader positioning is increasingly clear:

- **Kira** = autonomous AI editorial (with rigorous quality gates and an audit trail)
- **Klinchapp the product** = autonomous AI generation for users
- **Use Cases** = autonomous AI demonstrating itself (closes the dogfood loop)

If all three are 100% AI end-to-end, the brand story becomes: *"every artifact on this site, including this very page, was generated by AI. No humans wrote, edited, or curated this content. We don't just sell AI tools — we are an AI."*

That's a defensible, distinctive position in a market saturated with "AI-assisted" tools that quietly have humans in the loop. It also doubles as a continuous proof of capability — every successful pipeline run is evidence that the product works.

The Use Cases track, done as fully-autonomous AI, is the missing third leg of this stool.

---

## Out of scope (deferred / probably never)

| Item | Why deferred |
|---|---|
| Video versions of use cases | Wait for results from audio/video pilot first (`Blog-Audio-Video-Research.md`) |
| Customer testimonial pages | Requires customers willing to be featured |
| Interactive demo (upload your own photo) | Engineering scope much larger than the use case track itself |
| User-submitted use case gallery | Quality control too expensive at small scale |
| Use cases in non-English languages | Same QA blocker as multilingual blog (no team capacity to verify Arabic/Hindi output quality) |
| Per-vertical landing pages (`/for/[vertical]`) | Possible v2 — built on top of `/use-cases/[slug]` content. Defer until use case track itself is proven. |

---

## Maintenance

This document is reviewed and updated:

- **When a trigger condition fires** — update from "deferred" to "in progress"
- **When the build starts** — add an Implementation Checklist section (matching the pattern in `Blog-Project_Status.md`)
- **After significant strategic shifts** — if klinchapp's positioning changes substantially, the vertical selection and content strategy will need revisiting
