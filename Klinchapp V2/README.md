# Klinchapp V2

Platform-page redesign + homepage redesign. Two-phase cutover.

---

## ⚠️ Status — 2026-05-03

**Phase 1 (platform pages): SHIPPED to production.** PR [#15](https://github.com/Klinchapp/klinchapp/pull/15) · commit `e049a25`.

Live at canonical URLs (no `/v2/` prefix, no locale segment):
- `/ai-instagram-post-generator` — replaced existing live page
- `/ai-linkedin-post-generator` — replaced existing live page
- `/ai-twitter-post-generator` — new
- `/ai-facebook-post-generator` — new
- `/ai-tiktok-caption-generator` — new

**Phase 2 (homepage): pending.** See [`Phase2-Plan.md`](./Phase2-Plan.md) for the full execution plan, trigger conditions, and risks. Earliest fire date ~2026-05-10. Latest sensible fire date ~2026-05-17.

---

## Where the code lives now (post-Phase-1)

Documentation in this folder still references `app/v2/` paths in some places — that history is preserved for archive purposes. Current canonical locations:

| Was (in v2 staging) | Is now (in production) |
|---|---|
| `app/v2/_components/platform-page.tsx` | `app/components/platform-page.tsx` |
| `app/v2/_configs/platform-types.ts` | `lib/platforms/types.ts` |
| `app/v2/_configs/platforms/{instagram,linkedin,facebook,tiktok}.ts` | `lib/platforms/{...}.ts` |
| `app/v2/_configs/platforms/x.ts` | `lib/platforms/twitter.ts` (slug renamed) |
| `app/v2/[locale]/ai-{platform}-post-generator/page.tsx` | `app/ai-{platform}-{post,caption}-generator/page.tsx` (5 thin route wrappers) |

**What's still in `app/v2/`** post-cutover: only the v2 homepage at `app/v2/[locale]/page.tsx` (Phase 2 staging). All v2 platform routes were deleted. Locale codes were trimmed from 6 to `['en']` only.

---

## What this is

The current platform marketing pages at `/ai-instagram-post-generator` and `/ai-linkedin-post-generator` follow a generic SaaS landing-page pattern (hero → 3-step explainer → features → FAQ → CTA) that mirrors competitors like `socialpost.ai/free-post-generator` too closely. Step 2 even shares wording: "Pick Platform & Tone" / "Pick Instagram & tone."

This v2 replaces that template with a content-driven layout:

1. **Output-first hero teaser** — visitor sees the tool's output cycling above the fold, no auth wall.
2. **9-tone gallery** — same product, 9 voices, side-by-side. Demonstrates voice control.
3. **Caption anatomy** — one annotated caption with rationale per part. Teaches what makes the caption work.
4. **5-question FAQ** — platform-specific.
5. **Quiet end CTA** — single banner.

The same template works for all 5 social platforms (Instagram, LinkedIn, X, Facebook, TikTok) and all 6 languages (English, Spanish, Portuguese, French, Arabic with RTL, Hindi).

---

## How to run locally

```bash
npm run dev
```

Then visit any of the **12 staging URLs** (2 platforms × 6 locales):

| Locale | Instagram | LinkedIn |
|--------|-----------|----------|
| English | `/v2/en/ai-instagram-post-generator` | `/v2/en/ai-linkedin-post-generator` |
| Spanish | `/v2/es/ai-instagram-post-generator` | `/v2/es/ai-linkedin-post-generator` |
| Portuguese | `/v2/pt/ai-instagram-post-generator` | `/v2/pt/ai-linkedin-post-generator` |
| French | `/v2/fr/ai-instagram-post-generator` | `/v2/fr/ai-linkedin-post-generator` |
| Arabic (RTL) | `/v2/ar/ai-instagram-post-generator` | `/v2/ar/ai-linkedin-post-generator` |
| Hindi | `/v2/hi/ai-instagram-post-generator` | `/v2/hi/ai-linkedin-post-generator` |

All pages have `noindex, nofollow` — Google never sees them.

---

## Approval workflow

1. Build on `/v2/`. User reviews on localhost.
2. On approval: copy `app/v2/[locale]/ai-instagram-post-generator/page.tsx` content over `app/ai-instagram-post-generator/page.tsx`. Repeat for LinkedIn.
3. Delete `app/v2/`.
4. Future platforms (FB, TikTok, X) get added by writing a config in `_configs/`; route files mirror IG/LinkedIn.
5. Full-site i18n migration (moving live routes under `app/[locale]/...`) is a separate task tracked in `decisions-log.md`.

**No staging deploys. No canonical changes. No shipping until explicit sign-off.**

---

## Out of scope this session

- **FB, TikTok, X content.** Configs are stubs; pages render a "Coming soon" placeholder.
- **Non-English content.** i18n structure is built; non-English locales currently render English fallback with a "Coming soon" badge until translated samples are generated (likely using Klinchapp's own API).
- **Full-site i18n migration.** The live `/ai-instagram-post-generator` route stays English-only until v2 is promoted from staging.

---

## Read before contributing

| Doc | Why |
|-----|-----|
| `architecture.md` | Why one template + N configs, what it prevents, file layout |
| `config-schema.md` | The `PlatformConfig` contract for adding platforms |
| `content-guide.md` | 9 tones, 5 platforms, 6 languages reference + writing rules |
| `decisions-log.md` | Why we chose what we did. Append-only |

---

## Folder map

```
Klinchapp V2/                  ← this folder (docs, source of truth)
app/v2/                        ← code
  _components/                 ← template + sub-components
  _configs/                    ← platform configs + types
  _i18n/                       ← locale dictionaries, RTL helper
  [locale]/                    ← route files (4 lines each)
  layout.tsx                   ← noindex meta
```
