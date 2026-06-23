# Session Log — 2026-06-23

## Shipped

| PR | Subject | Status |
|---|---|---|
| #68 | Blog index Kira hero rewrite (correct surface) + Leaflet dedup fix | Merged |
| #69 | Answer-first paragraphs for 3 posts (quality-over-quantity, train-ai, ethics-of-ai) | Merged |
| #70 | deep-analysis format: FAQ block changed from optional to REQUIRED | Merged |
| #71 | Mobile hamburger menu for homepage section anchors | Merged |

---

## PR #68 — Kira intro on correct surface + Leaflet dedup

**Kira intro:** The previous session (PR #67) had applied the strategy doc Kira hero rewrite to `/blog/author/kira` — the wrong surface. The strategy doc explicitly quoted the blog INDEX copy as the target. Fixed in PR #68 by rewriting `app/blog/page.tsx` Kira hero section with the strategy doc's exact recommended copy:

> "I'm Kira — Klinchapp's AI. I research, write, and publish this blog. All of it. Not as an experiment. As a standard. [...]  Opinionated. Evidence-backed. No filler. No cheerleading."

Root cause of the original miss: a prior locked rule ("soften meta only, not body copy") silently overrode new instructions. Lesson: when new instructions arrive, explicitly check whether they supersede prior locked rules before implementing.

**Leaflet dedup:** Normal mode in `scripts/syndicate-to-leaflet.mjs` was calling `createRecord` unconditionally — no check for an existing record with the same path. Fixed by adding `getAllDocumentRecords` lookup before create/put decision. Same pattern already used in `--update-all` mode.

---

## PR #69 — Answer-first paragraph backfill (3 posts)

Previous sessions had left messy state on 3 posts — duplicate paragraphs, literal "Here's your answer-first paragraph:" text, and conflicting attempts. PR #69 cleaned all three and applied exact strategy doc wording:

- `ai-content-quality-over-quantity.mdx` — removed H1 + duplicate paragraphs, replaced with strategy doc paragraph on quality vs quantity
- `train-ai-your-writing-style.mdx` — removed two conflicting answer-first attempts, replaced with strategy doc 3-sentence summary (collect samples → style guide → system prompt)
- `ethics-of-ai-content.mdx` — removed H1 + two messy attempts, replaced with strategy doc transparency paragraph

All three posts also had the correct FAQ sections already in place — FAQPage schema was already emitting for them.

---

## PR #70 — FAQPage schema: forward coverage secured

### Discovery: FAQPage is already auto-generating

`detectFAQ` in `lib/blog-schema-detection.ts` is already wired into `app/blog/[slug]/page.tsx` (lines 136-147). It auto-emits FAQPage JSON-LD for any post with 3+ consecutive `###` headings ending with `?`. No new code was needed.

**Coverage audit:**
- 11 of 21 published posts already have qualifying FAQ sections → FAQPage schema emits today
- 10 posts don't have FAQ sections → no schema
- Forward-only approach chosen: no backfill of the 10, ensure all new posts qualify

**Gap analysis by format:**
- `tool-review`: FAQ already REQUIRED → covered
- `research-breakdown`: FAQ already REQUIRED → covered
- `how-to-guide`: no FAQ (HowTo schema instead) → covered differently
- `opinion`: explicitly no FAQ (intentional — weakens narrative voice) → correct
- `roundup`: optional → situational, acceptable
- `deep-analysis`: was optional → **changed to REQUIRED (PR #70)**

PR #70 is a one-line change to `scripts/blog-format-definitions.mjs`. Every new deep-analysis post going forward will include a FAQ block and emit FAQPage schema automatically.

---

## PR #71 — Mobile hamburger menu

### Background

The marketing homepage header (`SiteHeader variant="marketing-home"`) shipped with the 5 section anchor links wrapped in `hidden md:flex` — invisible on mobile. This was a deliberate park decision from 2026-05-15. Picked up today.

### What was built

`app/components/site-header.tsx` converted from server component to client component (`'use client'`). Changes:

- `useState` for `menuOpen`
- `useEffect` + `headerRef` for click-outside-to-close
- Hamburger/close SVG icons (inline, no external dependency)
- `NAV_LINKS` array extracted — shared between desktop `CenterNav` and the mobile dropdown (single source of truth)
- Mobile hamburger button: `md:hidden`, only renders when `variant === 'marketing-home'`
- Mobile dropdown: full-width panel below the header bar, each link closes the menu on tap

**Other variants unaffected.** Blog page, back-home, back-blog — no hamburger renders.

### Design note clarified during session

The 5 homepage anchor links (How it works / Who it's for / Voices / Platforms / FAQ) deliberately show in the blog page header too — this is intentional product-funnel design. Blog readers on desktop see the anchors as a quiet reminder that Klinchapp is the product behind the blog. Not a bug.

---

## Leaflet 404 — ongoing

Status: still unresolved. Path format investigation showed:
- `/blog/{slug}` → raw 404
- `/{slug}` → Leaflet's own "Sorry, post not found!" page (progress — subdomain and publication are active)

A `--test` flag was added to `syndicate-to-leaflet.mjs` locally (not committed — decision on final path format pending Leaflet response). DM sent to @leaflet.pub on Bluesky. Awaiting response.

A duplicate `chatgpt-claude-gemini-compared` record was created during the path-format PoC (before dedup was added). Needs a one-off `deleteRecord` cleanup once the path format question is resolved.

---

## Documents updated this session

| Document | Purpose |
|---|---|
| `app/blog/page.tsx` | Kira hero rewritten per strategy doc (PR #68) |
| `content/blog/ai-content-quality-over-quantity.mdx` | Answer-first paragraph fixed (PR #69) |
| `content/blog/train-ai-your-writing-style.mdx` | Answer-first paragraph fixed (PR #69) |
| `content/blog/ethics-of-ai-content.mdx` | Answer-first paragraph fixed (PR #69) |
| `scripts/blog-format-definitions.mjs` | deep-analysis FAQ changed optional → REQUIRED (PR #70) |
| `scripts/syndicate-to-leaflet.mjs` | Dedup fix (PR #68); --test flag added locally (uncommitted) |
| `app/components/site-header.tsx` | Mobile hamburger menu (PR #71) |
| `memory/project_seo_parked_work.md` | Tier 1 #3 marked done; FAQPage schema status recorded |
| `memory/project_homepage_marketing_home_tbd.md` | Marked RESOLVED |
| `memory/MEMORY.md` | Index entries updated |
| `New Functionality/Session-Log-2026-06-23.md` | This file |

---

## Pending from this session

| Item | Status |
|---|---|
| Leaflet 404 resolution | Waiting on @leaflet.pub DM response |
| Duplicate Leaflet chatgpt record cleanup | Blocked on Leaflet path format decision |
| `--test` flag commit in syndicate-to-leaflet.mjs | Uncommitted locally — hold until Leaflet responds |
| Tier 1 #5 image-first landing page | Parked — only remaining Tier 1 item |
