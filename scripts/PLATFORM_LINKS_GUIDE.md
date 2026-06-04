# Platform Internal Links Guide

Why this exists: every external SEO audit (Wren, Claude, Gemini, the 2026-06-02 audit) flagged the same Tier-1 gap — Klinchapp's blog posts mention "Instagram / LinkedIn / X / Facebook / TikTok" by name dozens of times but never link to Klinchapp's own platform pages (`/ai-instagram-post-generator`, etc.). Sample data: `ai-social-media-platform-guide.mdx` has 43 platform mentions, 0 internal platform links.

This is the rule-based fix.

## The rule

For each blog post, for each of the five platforms, the **first plain-text occurrence** of the platform name gets converted to a markdown link to the matching Klinchapp platform page.

| Platform alias matched | URL |
|---|---|
| `Instagram` | `/ai-instagram-post-generator` |
| `LinkedIn` | `/ai-linkedin-post-generator` |
| `X` or `Twitter` (either alias wins the single slot) | `/ai-twitter-post-generator` |
| `Facebook` | `/ai-facebook-post-generator` |
| `TikTok` | `/ai-tiktok-caption-generator` |

**Only the first occurrence per platform** is linked. Linking every "Instagram" in a 1500-word post reads as gamed and Google deprecates over-internal-linking.

## Skip rules

The linker explicitly does NOT touch:

- Lines inside ` ``` ` code fences (preserves code samples)
- Headings (`#` through `######`) — links in headings break structural ranking signals
- Text already inside a markdown link `[...](...)` — bracket-counting heuristic catches "the platform name is the display text of an existing link"
- Text immediately followed by `](` or `]` — same protection from a different angle

## Case sensitivity

Match is **case-sensitive**. The aliases above are exact-cased.

Reason: a case-insensitive match would link `instagram.com` inside a URL. Kira's prose uses PascalCase platform names (verified across the existing 17 posts); URLs use lowercase. Case-sensitivity cleanly separates the two.

## Idempotency

Running the backfill twice on the same post does not double-link. Reason: after the first pass, every platform's first occurrence is wrapped in `[...](/ai-X-post-generator)` — and the bracket-counting rule prevents the second pass from matching text inside an existing link.

## Single source of truth

`PLATFORM_LINKS` constant and `addPlatformLinks(content)` function live in `scripts/blog-pipeline.mjs`. Both the live pipeline (called from inside the prepare step, just before `assembleMdx`) and the backfill script (`scripts/backfill-platform-links.mjs`) import the same function. No duplicated logic.

If you change the platform → URL mapping, change it in `blog-pipeline.mjs` only and rerun the backfill.

## Running the backfill

```bash
# Dry-run first (shows the diffs without writing). No API key needed.
node scripts/backfill-platform-links.mjs --dry

# Then write
node scripts/backfill-platform-links.mjs

# Target a specific post
node scripts/backfill-platform-links.mjs --only=ai-social-media-platform-guide
```

Output for each changed post: per-line diff showing the `[Instagram](...)` insertion and a count of links added.

## What this does NOT do

- Does not link platforms in headings (intentional — structural ranking signal protection)
- Does not link every occurrence (intentional — anti-spammy)
- Does not link based on LLM judgment (rule-based is more reliable; LLM would be more expensive and slower for zero quality gain)
- Does not modify the frontmatter (only the post body content gets touched)
- Does not handle other Klinchapp internal pages (`/contact`, `/pricing`, etc.) — those have different SEO weight characteristics and aren't part of the convergent audit recommendation
