# Hook Prompt Guide — Klinchapp Blog Carousel Cards

Single canonical reference for what the `hook` field is, what voice it should carry, and how to regenerate it across the catalogue.

The spec is defined once in code as `HOOK_PROMPT_SECTION` in `scripts/blog-pipeline.mjs`. Both the live publishing pipeline (`generateSocialSnippets`) and the bulk backfill script (`scripts/backfill-hooks.mjs`) use that constant — there is no second copy. If you change the spec, change it there and rerun the backfill.

**What the LLM actually sees per call:** title + frontmatter description + the first 2000 characters of the post body (the lede, framing, and 2-3 main arguments). This is the third arg to `generateHookOnly(title, brief, content)`. The body is essential — without it, the LLM has only the SEO description to guess from, which causes fabricated specifics. With it, the LLM can quote real angles from the actual post.

## What the hook is

The `hook` field lives in each post's MDX frontmatter and is the **lead text on Recent Highlights carousel cards** at `/blog`. The carousel is the first thing a reader sees on the index page — cards are ~180–200px wide, and the hook is the only editorial copy that fits before the date and "Read more →" link.

Fallback chain in `app/blog/recent-carousel.tsx`:

```
post.hook → post.social.twitter → post.description
```

If `hook` is absent, the card falls back to the Twitter snippet, which is voiced for Twitter not for a small card. So the hook isn't optional — it's the difference between a card that earns a click and one that reads like cribbed Twitter copy.

## The voice — witty, anchored, clever, fresh-canvas

The decision (2026-06-02 → tightened 2026-06-03 in three passes): **make the hooks really punchy by leaning into wit**, anchored in the post's actual content with no leakage from the LLM's training data. Concretely:

- **Fresh canvas (the most important rule).** The LLM only uses information explicitly in the title + summary + content excerpt it's given. Not training data, not "what posts like this usually say," not pattern-matched stats. If a number isn't quoted in the content above, it cannot appear in the hook. This is the rule that catches the "82% of recruiters use AI" pattern-completion that caused multiple fabrications in the first wit pass.
- Witty is sharper than dry — clever pivots and word choice doing double duty, not just deadpan contrasts.

- Wit is the **goal**, not an option. Find the cleverly amusing angle in the post's actual content — a sharp pivot, a layered observation, a precise word doing double duty, a "did they just say that" moment.
- **Witty + clever > dry > slapstick.** New Yorker cartoon caption / The Onion's sharpest headlines / a stand-up setup that turns on a single precise word. Not "lol", not "🤣", not generic snark.
- **Anchored in the post's real subject.** No invented brands, no fake stats, no made-up specific quantities (dollar amounts, percentages, post counts) even as comedic shorthand — if the post doesn't quote the number, the hook can't either. No generic "everyone hates Mondays" jokes. ([[feedback_no_fabrication]])
- **Sensitive-topic carve-out.** If the post is about ethics, layoffs, discrimination, bias, mental health, financial harm to vulnerable parties, or other genuinely sensitive subjects, drop the wit entirely. When in doubt, default to declarative. Better to land flat than to land wrong.

### Length

80–130 characters. Tighter than the Twitter snippet, looser than a tweet title. Long enough for a setup + punchline, short enough to fit a 200px card without truncation.

### Banned

- Hashtags
- Emojis (render unpredictably across card sizes)
- Banned phrases **anywhere in the hook** (not just as openers): `Plot twist:`, `Spoiler:`, `Spoiler alert:`, `POV:`, `Hot take:`, `Real talk:`, `Here's the deal:`, `Pro tip:`, `TL;DR:`, `Newsflash:` — they signal lazy writing on a card

### What good looks like

The four canonical examples (also embedded in `HOOK_PROMPT_SECTION` so the LLM sees them every call):

- *"Your chatbot has a 9.8 satisfaction score. Your customers do not."*
- *"Your AI has a brand voice. It's 'tired marketing intern at 4pm'."*
- *"Boolean strings still hire better than your AI thinks they do."*
- *"Your AI writes in your voice. Sort of. The 11pm version of your voice."*

All four: ~50–100 chars; wit drawn from the post's specific topic; one precise word doing the work; no clichés or emojis; could stand alone on a card.

## Running the backfill

```bash
# First-time safe pass — only fills in posts that have no hook field yet.
node scripts/backfill-hooks.mjs

# After a spec change — regenerates every hook, even ones already present.
node scripts/backfill-hooks.mjs --regenerate-all

# Eyeball first, write later.
node scripts/backfill-hooks.mjs --dry --regenerate-all

# Target a specific post or two.
node scripts/backfill-hooks.mjs --only=ai-mistakes-small-businesses,train-ai-your-writing-style
```

**Env required:** the same keys the pipeline uses — `ANTHROPIC_API_KEY` at minimum. `.env.local` is auto-loaded.

**Idempotency:** the script writes the same frontmatter shape (`hook: "..."`) regardless of how the field arrived. Running it twice with `--regenerate-all` produces two different hooks (LLM is stochastic), so commit between runs if you want stable diffs.

## Workflow when changing the spec

1. Edit `HOOK_PROMPT_SECTION` in `scripts/blog-pipeline.mjs`. (Don't edit the inline-equivalent string in this guide — update both *from* the code constant if you want them aligned. The constant is the source of truth.)
2. Run `node scripts/backfill-hooks.mjs --dry --regenerate-all` and eyeball the proposed hooks.
3. If they look right, drop `--dry` and rerun. Commit the diff.
4. Push, deploy, verify on /blog that the carousel cards read as intended.

## What this does NOT change

- The Twitter, LinkedIn, Instagram, Facebook, TikTok snippets in `social:` — those have their own per-platform voice rules in `generateSocialSnippets` and are untouched by the backfill.
- The blog post body — Kira's content is generated separately and isn't re-run by this script.
- The publishing cadence — backfill is one-off; the pipeline still runs Tue/Fri publishes on its normal schedule.
