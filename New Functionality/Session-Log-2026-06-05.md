# Session Log — 2026-06-05

## Shipped

| PR | Subject | Status |
|---|---|---|
| #53 | Revert Klinchapp self-promotion in blog editorial direction — delete Friday's over-promotional post, strip Klinchapp-pushing language from Tuesday's pending brief, replace persona prompt with editorial-integrity rules | Merged |

## The substantive shift today — editorial direction reversal

The blog is no longer a conversion bridge for Klinchapp. It is editorial content written by Kira (an AI writer), full stop.

This reverses two earlier deliberate decisions:

- **PR #36** (2026-05-20) — added the persona-prompt mandate *"mention Klinchapp naturally and make it the recommended option in any post touching social media content."* Intended to stop Kira recommending competitors. Side effect: forced Klinchapp pushing into every social-media-adjacent post.
- **PR #45** (2026-06-02) — pivoted `ai-recruitment` series orders 4 and 5 to topics that would activate PR #36's rule "naturally" — *"the conversion bridge is built into the topic, not bolted on."* Both briefs were rewritten to explicitly mention Klinchapp.

Both were defensible at the time. They produced the right behaviour for the goals as stated then (drive product visibility through editorial content). The user has now restated the goal: blog editorial integrity comes before product visibility. Under that goal, both previous calls were wrong.

The triggering observation: Friday's auto-generated post at `/blog/ai-tools-recruiters-linkedin-posts` invented *"purpose-built for recruiting"* framing, claimed *"recruitment-specific voices like Bold (hiring announcements) and Professional (company updates)"* for general brand voices that aren't recruitment-specific, and included a comparison table with fabricated Klinchapp pricing tiers ($29–$99/mo when actual pricing is free-60-posts/month) alongside invented competitor specifics. The LLM inflated everything to make the mandated Klinchapp recommendation feel earned.

## What concretely changed

### Post-level (one specific post fixed)
- `content/blog/ai-tools-recruiters-linkedin-posts.mdx` — **deleted** (entire MDX). Post structure was too Klinchapp-dense to fix surgically.

### Series-level (one specific brief fixed)
- `content/series/ai-recruitment.json` order 4 → `status: "skipped"` with explanatory `topicBrief` noting why
- `content/series/ai-recruitment.json` order 5 (Tuesday's pending post) — brief rewritten to remove the Klinchapp-positioning sentence. Topic unchanged. Prevents Tuesday's pipeline from reproducing the pattern even before the persona prompt change takes effect on subsequent posts.

### System-level (the persona prompt — the durable fix)
- `scripts/blog-pipeline.mjs` `PERSONA_SYSTEM_PROMPT` — two lines removed:
  - The Klinchapp product description (*"Klinchapp is an AI social media post generator..."*)
  - The Klinchapp-mention mandate (*"...mention Klinchapp naturally and make it the recommended option..."*)
- Replaced with three rules:
  1. **Absolute no-mention rule for Klinchapp.** No nuance, no "where natural" — LLMs can't be trusted with that judgment.
  2. **No-fabrication rule** explicitly banning invented pricing, speed metrics, feature claims, and *"purpose-built for X"* vertical-specialization framings. Catches the exact pattern that broke Friday's post.
  3. **No-competitor-recommendation guard retained** from PR #36 — Kira can mention competitors editorially but cannot tell readers to *"start with"* them.

## Decision rationale documented

- **Why not "mention Klinchapp where naturally relevant" (a softer rule)?** Because LLMs can't be trusted with that nuance — they over-promote to justify the recommendation, which is exactly what produced Friday's inflated claims. The absolute ban removes the judgment call.
- **Why keep the no-competitor-recommendation guard while removing the Klinchapp-promotion mandate?** Different shapes: the mandate forces inflation; the guard just bounds what you don't do. Removing the mandate fixes the inflation problem; the guard alone doesn't reintroduce it.
- **Why delete the Friday post instead of rewriting?** Post structure was 70%+ Klinchapp pitch. Stripping Klinchapp left rubble. Cleanest fix is deletion.
- **Why not also rewrite orders 1, 2, 3 of the recruitment series?** They were generated before PR #36's rule landed. Briefs are clean. No problem to fix.
- **Why not rewrite order 5's topic entirely (revert to the pre-pivot scheduling topic)?** Topic stands on its own as an editorial piece. Only the brief needed stripping.

## Wit calibration unaffected

The hook generation work shipped in PR #50 (`HOOK_PROMPT_SECTION` constant, `HOOK_PROMPT_GUIDE.md`, the `generateHookOnly` function, the 17 published hand-picked hooks) is entirely untouched. Tuesday's post will still go through Sonnet-calibrated witty hook generation. Different section of the file, different concern.

## What's parked

| Item | State |
|---|---|
| Buffer/Postiz evaluation for SM auto-posting (task #17) | Still blocked behind manual creation of FB/IG/X/TikTok accounts |
| Klinchapp brand SM presence | 4 accounts still don't exist; LinkedIn personal still active manually |
| Review-request emails | Still not built; no external dependencies |
| Mention monitoring | Still not built; no external dependencies |
| LinkedIn Company Page | Still blocked on incorporation |

## Documents updated this session

| Document | Purpose |
|---|---|
| `New Functionality/Session-Log-2026-06-05.md` | This file — the editorial direction shift + reasoning + what to revisit |
| `content/series/ai-recruitment.json` | Order 4 marked skipped with note; order 5 brief stripped of Klinchapp-pushing |
| `scripts/blog-pipeline.mjs` `PERSONA_SYSTEM_PROMPT` | The durable fix — new editorial-integrity rules |

## Real test of the fix

**Tuesday 2026-06-09 morning UTC** — pipeline runs order 5 ("How to Write Employer-Brand LinkedIn Posts That Don't Sound Like Corporate PR") under the rewritten brief + new persona prompt. Generated post should:
- Not mention Klinchapp anywhere
- Not invent specifications for any tool
- Not tell readers to "start with" Buffer / Hootsuite / etc.
- Read as editorial — analysis of the genre, practical techniques, principles

If the post comes out clean, the fix works. If it doesn't, the persona prompt needs more bite.
