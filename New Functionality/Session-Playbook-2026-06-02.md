# Klinchapp Session Playbook — 2026-06-02

A guide to what was built, the architectural patterns that emerged, the
decisions and their rationale, and what's parked for the next session.
Written for use as a reference when starting a similar project.

---

## 1. What shipped today

Five PRs, in merge order.

### PR #43 — Remove placeholder disclaimer from production homepage
A development-time disclaimer (`"Captions shown are placeholder translations
for layout review. Native-speaker review before launch."`) had shipped to
production and stayed live. Removed.

**Pattern to apply elsewhere:** SEO reports often flag "unfinished product"
signals in production copy. Sweep for them periodically — they cost CTR
and trust, and they're cheap to fix.

### PR #44 — SGE-friendly Kira prompts, tighter length, FAQ/HowTo schema
Three coordinated changes preparing Kira for the AI Overviews era.

- New `scripts/blog-format-definitions.mjs` — single source of truth for
  the six format types Kira can write in (`deep-analysis`, `opinion`,
  `how-to-guide`, `tool-review`, `research-breakdown`, `roundup`). Each
  format declares: description, length target, SGE opening rule,
  structural block requirement.
- `scripts/blog-pipeline.mjs` `PERSONA_SYSTEM_PROMPT` updated:
  - Length now format-conditional (`600–800` informational, `800–1000`
    heavier) instead of flat `800–1200`.
  - New "Structure for AI Extraction" rules: direct-answer leads, no
    hedging, citable specifics, format-required structural blocks.
- `scripts/blog-planner.mjs` updated — when Kira generates new series
  blueprints, she sees full format contracts (not just names) so format
  selection accounts for structural requirements.
- `lib/blog-schema-detection.ts` (new) — detects FAQ blocks (3+ `###`
  questions ending in `?`) and HowTo blocks (5+ numbered steps) in the
  rendered post.
- `app/blog/[slug]/page.tsx` — emits matching `FAQPage` and `HowTo`
  JSON-LD alongside the existing `Article` schema when the detector
  finds qualifying blocks.

**Pattern to apply elsewhere:** When you have an LLM that writes structured
content, define the structure types in **one shared module** that both the
topic planner and the writer reference. Drift between "what format the
planner picked" and "what format the writer was told to produce" creates
subtle quality issues that are hard to diagnose.

### PR #45 — Recruitment series 4–5 pivoted to social-media-for-recruitment
The recruitment series was chosen for LinkedIn distribution, but the
middle posts targeted recruiter-operations categories (sourcing,
screening, interviewing) — territories Klinchapp doesn't compete in.
Audience overlap with LinkedIn recruiters held, but the conversion
bridge to Klinchapp's product was zero.

- Order 4 ("AI Interview Tools 2026") → "AI Tools That Help Recruiters
  Write Better LinkedIn Posts"
- Order 5 ("AI Scheduling") → "How to Write Employer-Brand LinkedIn
  Posts That Don't Sound Like Corporate PR"
- Orders 6 and 7 (resume-builders, will-AI-replace-recruiters) kept
  as-is. Those are LinkedIn lightning-rod topics accepted for
  brand awareness even though they don't bridge to the product.

**Pattern to apply elsewhere:** "Will the audience drawn by this content
naturally want our product?" is a separate question from "Does this
content get engagement on the channel?" Both have to be yes for an
editorial topic to earn its place — engagement without conversion
intent is brand awareness, valuable but expensive.

### PR #46 — The Kira archive carousel + 20-colour palette + hook field
The `/blog` page used to paginate, hiding older posts off page 1.
Replaced with a horizontally-scrolling carousel ("The Kira archive")
that shows every published post as a colour-variant card. No post
gets buried by recency.

- `lib/blog-hero-variants.ts` expanded from 10 to 20 colours, interleaved
  so adjacent palette indices alternate purple ↔ vibrant.
- `getHeroVariant()` switched from char-code sum to djb2-style hash
  (`h = h*31 + char`) — sum-of-chars was clustering similar slugs on the
  same indices.
- New `isPurpleVariant()` helper. Carousel applies a left-to-right pass:
  if a card matches the previous card exactly OR both are purples, the
  card shifts colour forward through the palette until a non-violating
  one is found. First card and post-detail page always use pure slug
  hash.
- New `BlogPost.hook?: string` field, parsed from MDX frontmatter.
- Card content fallback chain: `hook → social.twitter → description`.
  `hook` is Klinchapp's own punchy lead copy; `social.twitter` stays
  formal for user copy-paste sharing.
- `app/blog/recent-carousel.tsx` (new, `'use client'`) — horizontal flex
  row with overflow-x-auto + scroll-snap-x mandatory, arrow buttons that
  disable at edges, native swipe on mobile. Cards 180px mobile / 200px
  desktop, min-h 240px.
- Cards display: hook only (no title, no chip), date, "Read more →".
  Visible text on every card is distinct, so the link's accessible name
  is already descriptive — no `aria-label` needed.

**Pattern to apply elsewhere:** When you need per-item visual variants
(coloured cards, gradients, etc.) that should be **stable** across deploys,
use a **deterministic hash of a stable identifier** (slug, ID) into a
palette. Reach for a real hash (djb2, fnv-1a) not character-sum — the
naive version clusters badly on real-world identifiers that share prefixes.

### PR #47 — Punchier Twitter snippets + dedicated hook generation
Kira's Twitter snippets were corporate-survey-toned and ~190 chars long
— too long for the new carousel cards, too formal for engagement.

- Twitter prompt in `generateSocialSnippets`:
  - Length: `under 260 chars` → `80–130 chars`
  - Voice: lead with conclusion, never with setup question; declarative;
    humor when topic supports; banned "what X is your Y hiding?"
    patterns and clichés
  - Three few-shot example snippets in the prompt itself
- New `hook` output field generated alongside the social snippets:
  - 60–100 chars
  - No hashtags, no emojis
  - Used as the lead on `/blog` carousel cards
  - Few-shot examples
- `assembleMdx` writes `hook:` into the post's top-level frontmatter
- Fallback: hook falls back to the truncated post title if generation
  fails — cards never render empty

**Pattern to apply elsewhere:** When the same content has to serve
**two distinct audiences** (e.g. "what the user copy-pastes to their
own social handle" vs "what we display on our own site"), don't reuse
one snippet for both. Generate two outputs with two different sets of
rules. The audiences want different things.

---

## 2. Architectural patterns worth porting to other projects

### Two-stage autonomous content pipeline (prepare → publish)
Generation and release are separate stages.

- **Prepare** runs on its own cron (e.g. Mon/Thu). Researches, writes,
  scores, commits as `status: scheduled`. Quality gate: re-attempts on
  fail.
- **Publish** runs on a different cron (e.g. Tue/Fri). Flips status to
  `published`, pushes site rebuild, triggers syndication.
- **Catch-up:** if prepare didn't happen, publish step generates +
  publishes same-day.

Why two stages: separation of concerns. Prepare can fail loudly without
breaking the published-content cadence. Publish has nothing to do but
ship what's already written. Easier to monitor, easier to fix.

### Cron stagger off the top-of-hour boundary
GitHub Actions scheduled workflows are documented to delay or drop runs
at `:00` due to high load. Schedule everything off-the-hour at varied
minutes (`13`, `17`, `19`, `23`, `27`) and stagger across workflows.

```yaml
# Bad
- cron: '0 9 * * 2,5'

# Good — and add an inline comment so a future maintainer doesn't
# "tidy" the minute back to 0
- cron: '17 9 * * 2,5'
```

**Apply to any cron-driven system.** This isn't a Klinchapp quirk; it's
a GHA platform behaviour you'll hit everywhere.

### Failure-alert pattern for silent autonomous stages
Steps marked `continue-on-error: true` are silent by design — they don't
fail the workflow. That's correct behaviour (a syndication failure
shouldn't block the publish), but it's catastrophic for ops if there's
no alerting.

Pattern:
- Keep `continue-on-error: true` (don't let one syndication fail the
  workflow or skip subsequent syndications)
- Move failure detection **inside the script**: catch errors, send a
  Resend / SES / SMTP alert email with the specific error and
  remediation hint, then `process.exit(1)`
- Workflow stays green; operator gets an email immediately

Concrete example: `scripts/syndicate-to-blogger.mjs` sends a
"❌ Blogger syndication FAILED" email with the error inline, then
exits. The wrapping workflow stays green so WordPress syndication still
runs next.

### Format-conditional content rules via a shared definitions module
When an autonomous writer can pick from N content formats and each
format has different structural requirements, define the format
contracts in **one** module that both the planner (which assigns format)
and the writer (which produces content in that format) reference.

```
scripts/
  blog-format-definitions.mjs     ← single source of truth
  blog-planner.mjs                ← imports for the assign step
  blog-pipeline.mjs               ← imports for the write step
```

Without this pattern: the planner says "tool-review" and the writer
produces something that doesn't match what tool-review structurally
requires. Drift compounds across runs.

### Schema-from-content detection
Instead of asking the LLM to write JSON-LD schema directly (it
hallucinates), have the LLM write **structured content** (`### Q?`
followed by answer paragraphs; numbered step lists with bold action
verbs), then have a deterministic parser detect those patterns at render
time and emit JSON-LD.

Benefits:
- Schema is always valid (deterministic generation)
- Content stays human-readable
- Detection is conservative: if the pattern isn't there, no schema
  is emitted (no false positives)

Code lives in `lib/blog-schema-detection.ts`. The detectors are
intentionally conservative — `detectFAQ` requires ≥3 questions,
`detectHowTo` requires ≥5 numbered steps.

### Deterministic per-item visual identity with adjacency constraints
For per-item visual variants (card backgrounds, gradients, badges):

1. Define a palette as an array
2. Hash a stable identifier (slug, ID) → palette index
3. Render the item with `palette[hash(id) % palette.length]`

If you need adjacency constraints (e.g. "no two consecutive cards same
colour, no two consecutive cards in the same family"):

```ts
const colours = []
for (const item of items) {
  let c = palette[hash(item.id) % palette.length]
  while (i > 0 && violates(c, colours[i-1])) {
    c = palette[(palette.indexOf(c) + 1) % palette.length]
  }
  colours.push(c)
}
```

First item always gets its hash colour. Subsequent items shift only if
they'd violate the rule. Most items keep their hash-stable colour.
**Don't apply the constraints on the item-detail page** — the detail
page is permanent and its colour should be stable across deploys.

### No-fabrication editorial principle
Across this whole project there's a hard rule: **don't invent things
that aren't real.**

- No fake customer testimonials
- No invented usage statistics ("used by 10,000+ creators")
- No fake `aggregateRating` schema
- No "reviewed by [human name]" credit when no human reviewed
- No fabricated quotes from "industry leaders"
- AI cannot pose as a native speaker of a language the AI doesn't natively speak

When an LLM SEO report recommends any of these (and they recommend them
often, because they're a "best practice"), refuse. The cost of fake
trust signals when they're discovered is catastrophic; the cost of
omitting them is just slower growth.

### Hook field vs. social-snippet split
For shareable content (blog posts, products, anything users might
share to their own social channels), generate **two** copy assets:

- **Shareable copy** (`social.twitter`, etc.) — formal, neutral,
  attributable, longer, with hashtags. Belongs to the user when they
  share.
- **Display copy** (`hook`) — your own marketing voice, punchier, no
  hashtags, no emojis (for card-grid display), shorter. Belongs to you
  on your own site.

These are different audiences, different platforms, different rules.
One snippet trying to serve both is mediocre at both.

---

## 3. Decisions made and the reasoning

### Premise A: autonomy within rails, not absence of governance
The "Kira is autonomous" brand framing was clarified during this session
as meaning **content production autonomy** — research, topic selection,
writing — within editorial rails (the persona prompt, format types,
length targets, no-competitor-recommendations guardrail).

Not "the AI has unrestricted choice." That doesn't exist anywhere — not
in LLMs, not in human writers, not in any system. Autonomy operates
within rules everywhere.

The locked decision sits in `project_blog_engine.md`. Worth carrying
this framing to any other autonomous-AI-content project: be honest about
what's autonomous and what's a rail; the brand survives.

### Path C over Path B for E-E-A-T
LLM SEO reports kept recommending: add a fake "reviewed by human" credit
to soften the AI-authorship signal for Google's helpful-content systems
(Path B).

Decision: **Path C** — keep the autonomy, lean harder into transparency.
Publish the editorial standards (the 8 quality gates, the failover
chain, the provider list), link sources inline rather than dumped at
the end. Real transparency beats fake credentialing.

Lesson: when external advice recommends something that crosses the
no-fabrication line, refuse even if "it's industry standard."

### Strategic review checkpoint dates
"Audience-first content strategy: let the blog win even if the product
doesn't" is a defensible bet at klinchapp's stage, but defensible bets
need **time-bounded review**. Without a review checkpoint, the strategy
becomes "let the blog drift forever."

Locked checkpoint: 2026-10-30. Decision criteria documented in
`project_blog_engine.md` (audience growth + product signal trajectory).

Worth carrying: when a strategic bet is "give it time," nail the
date the bet gets evaluated.

### Multi-LLM SEO reports as input, not as a plan
Across this session we received reports from Claude.ai, Gemini, Grok,
Qwen. They overlapped heavily on basics, disagreed on positioning, and
each had a few unique insights.

The right consumption pattern:
1. **Score each report's freshness** — some have stale crawls and
   recommend things you've already shipped
2. **Look for convergence** — what 3+ reports flag independently is
   probably a real signal
3. **Look for unique insights** — what only one report flagged might
   be the most valuable thing in the pack
4. **Refuse recommendations that violate your principles** (no fake
   reviews, no fake credentials)
5. **Compare to your own backlog** — if the report tells you to do
   things already on your parked-work list, the list is right

The most valuable single insight in the entire session came from
Claude.ai's deep crawl: identification of a second contaminated blog
post (`ai-social-media-platform-guide.mdx`) recommending 10 competitors.
None of the other reports caught it.

---

## 4. Memory files updated

For a future session opening this project, these are the authoritative
state-of-the-world references:

- **`MEMORY.md`** — index, always loaded; links to everything below
- **`project_seo_parked_work.md`** — the backlog, organized by tier
- **`project_blog_engine.md`** — Kira architecture + editorial strategy
  + SGE direction + recruitment series pivot
- **`project_blog_syndication.md`** — Blogger/WordPress syndication,
  including the incident history with OAuth token expiry
- **`project_homepage_check_workflow_bug.md`** — known false-fail in
  the homepage-check workflow, parked for resolution
- **`project_homepage_marketing_home_tbd.md`** — parked mobile nav fix
- **`project_v2_cutover_notes.md`** + **`project_v2_cutover_phase1.md`**
  — historical context on the v2 cutover and what we kept
- **`feedback_no_fabrication.md`** — the no-fabrication rule, applies
  everywhere
- **`feedback_collaboration_style.md`** — sharp-editor working rhythm

When porting these patterns to another project, recreate this memory
structure: an index file + one project memory per concern + a few
feedback memories for working preferences. Cross-link liberally with
`[[memory-name]]` syntax.

---

## 5. Parked for next sessions

In rough priority order:

1. **Programmatic hook backfill** (~60–90 min). One-off script
   `scripts/backfill-hooks.mjs` that walks every existing MDX, calls
   the new prompt with title + brief, extracts a hook, patches it into
   the frontmatter. Cleanest because it uses the same prompt as new
   Kira generations, so all card hooks have a consistent voice.
2. **Verify Thursday's first SGE + punchy-hook post** (no PR — eyeball
   inspection). Confirm length is 600–800 words, opens with a direct
   answer, includes structural blocks per format, and produces a hook
   that fits a card.
3. **Platform-guide post rewrite** (urgent — was identified in earlier
   session). `ai-social-media-platform-guide.mdx` actively recommends
   10 competitors. Same surgical fix as PR #36 (`brand-voice` post)
   and PR #42 (`sourcing-vs-boolean` bridge).
4. **Audit remaining ~10 posts for the same pattern**. Quick grep
   for competitor names, decide which posts need surgical rewrites.
5. **GSC inspection** (1–2 sessions out per locked memory). Determines
   whether the action-recommendation engine has enough data to be
   worth building.
6. **Action-recommendation engine** (scoped, ~14 hours, parked pending
   GSC check). In-house weekly "do these 5 things" report instead of
   external LLM audits.
7. **Tier 1 #1**: blog → platform internal linking, fully or via the
   "build the linker as code" approach.
8. **Tier 1 #2**: `/about` + `/blog/author/kira` pages.
9. **Tier 1 #5**: dedicated image-first landing page.
10. **Tier 2 #6–9**: FAQPage schema on homepage, BreadcrumbList on
    blog posts, `next/image` migration, `/pricing` page.
11. **Tier 3**: Use Cases / Industries pSEO (with Prompt Library
    framing), persona pages, competitor comparisons, Arabic localised
    probe, original-research piece.

---

## 6. Things to apply to the next project from day one

### Operations
- **Schedule crons off the hour.** Every single one. With inline
  comments explaining why so a future maintainer doesn't "tidy" them.
- **Failure alerting inside scripts**, not just at the workflow level.
  `continue-on-error: true` plus in-script Resend alert is the right
  pattern.
- **Two-stage content pipelines** (prepare/publish) separate generation
  failures from release cadence.
- **Audit trail by default.** Every regression run commits a Markdown
  report. Every blog pipeline run logs to `_pipeline-log.json`.

### Editorial
- **Single source of truth** for format definitions / content rules.
  Shared modules > duplicated rules across files.
- **No-fabrication is a hard rule.** Even when an LLM recommends a
  fake-credential pattern as "best practice."
- **Two-audience copy assets** (formal-shareable + own-display-punchy)
  for any content that ships to multiple surfaces.
- **Format-conditional structural rules** — different content shapes
  have different requirements. Don't apply universal rules across all
  formats.

### Schema / SEO
- **Detect, don't ask the LLM to write JSON-LD.** Structured content
  + deterministic parser > LLM JSON output.
- **Per-post unique OG images** via the framework's image-generation
  route (Next.js `opengraph-image.tsx`) — no PNG management, no
  backfill needed.
- **Cards that surface every item** (carousel of all posts) so older
  content isn't buried by recency.

### LLM prompts
- **Few-shot examples beat abstract instructions.** "Punchy" means
  nothing; three example punchy snippets in the prompt produces
  punchy output.
- **Hard length limits in the prompt** (character counts, not "short").
  Vague brevity instructions produce ~mean-length output.
- **Stack prompt changes carefully** — change one thing per cycle,
  observe one cycle, then change another. If you stack, you can't
  attribute results.

### Memory and documentation
- **Editorial decisions need dated review checkpoints** ("this bet
  reviewed by [date], if X then Y") so they don't drift.
- **Cross-link memory files** liberally with `[[name]]` syntax so a
  future session opening any one memory finds the related context.
- **Brand framings need honesty about the implementation.** "Fully
  autonomous AI" reads great on a landing page, but in code there are
  always rails. Be straight about the framing internally even when
  you keep it bold externally.

---

## 7. Quick-reference: where things live in this repo

```
app/
  blog/
    page.tsx                       ← /blog with The Kira archive carousel
    recent-carousel.tsx            ← client component, scroll + arrows
    [slug]/
      page.tsx                     ← individual post + hero + schema detection
      opengraph-image.tsx          ← per-slug dynamic OG card
  components/
    platform-page.tsx              ← the 5 platform landing pages template
    site-header.tsx                ← used across marketing pages
  layout.tsx                       ← root metadata + sitewide JSON-LD
lib/
  blog.ts                          ← BlogPost interface + parsers
  blog-hero-variants.ts            ← 20-colour palette + djb2 hash + isPurple
  blog-schema-detection.ts         ← FAQ + HowTo detectors for JSON-LD
scripts/
  blog-pipeline.mjs                ← Kira: research → write → score → commit
  blog-planner.mjs                 ← Kira: research trends + generate series
  blog-format-definitions.mjs      ← canonical format type definitions
  syndicate-to-blogger.mjs         ← Blogger API push + failure alerts
  syndicate-to-wordpress.mjs       ← WordPress API push + failure alerts
  BLOGGER_API_SETUP.md             ← OAuth setup (incl. production-mode caveat)
  WORDPRESS_API_SETUP.md           ← App-password setup
content/
  blog/                            ← MDX posts written by Kira
  series/                          ← JSON series blueprints, hand-curated topics
.github/workflows/
  blog-prepare.yml                 ← Kira generate (Mon/Thu :13)
  blog-publish.yml                 ← release + syndicate (Tue/Fri :17)
  blog-planner.yml                 ← topic research (1st of month :23)
  homepage-check.yml               ← rendered-HTML assertions
  regression-on-main.yml           ← post-merge regression report
  ci.yml                           ← build + type check on PRs
```

---

## 8. The day in one paragraph

We turned `/blog` from a paginated 1-column list into a carousel of all
posts with per-post colour-variant cards, introduced a dual editorial
copy model (`hook` for our cards / `social.twitter` for user shares),
tightened Kira's prompts for SGE / AI Overviews citation, added auto-
detected FAQPage and HowTo schema, pivoted two recruitment-series posts
to land in Klinchapp's product category, and removed a stale "before
launch" disclaimer that had been live for weeks. Five PRs, ~15 file
edits, ~600 lines of working code, and one strategic review checkpoint
locked for end of October.

The recurring lesson: the right move is usually narrower than the
external recommendation. Reports asked for full multilingual site
translation; we did Arabic-only probe + pSEO with English+locale-
persona. Reports asked for 270 pSEO pages; we agreed to a prototype.
Reports asked for human reviewer credits to soften E-E-A-T; we refused
and went deeper into transparency instead. Reports asked for the title
on each card; we dropped it and let the hook carry.

Doing less, more carefully, is the pattern.
