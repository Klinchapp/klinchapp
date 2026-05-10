# Architecture

## ⚠️ Post-cutover note (2026-05-03)

Phase 1 shipped — file paths in this doc reference the original `app/v2/_components/...` and `app/v2/_configs/...` locations. After the cutover, the equivalent files live at:

- `app/components/platform-page.tsx` — the template
- `lib/platforms/types.ts` — `PlatformConfig` interface
- `lib/platforms/{instagram,linkedin,twitter,facebook,tiktok}.ts` — per-platform configs
- `app/ai-{platform}-{post,caption}-generator/page.tsx` — 5 thin route wrappers (~30 lines each)

The **architectural principle** below (one template + N configs) is unchanged and still correct. The file paths in the rest of this doc reflect pre-cutover staging locations. See `decisions-log.md` D15 for the full path migration table.

---

## Principle

**One template, N configs.**

A single `<PlatformGeneratorPage config={...} locale={...} />` component renders the entire page. Each platform supplies a typed `PlatformConfig` object. Route files are 4-line passthroughs. There is no per-platform JSX.

```tsx
// app/v2/[locale]/ai-instagram-post-generator/page.tsx
import { PlatformGeneratorPage } from '@/app/v2/_components/platform-generator-page'
import { instagramConfig } from '@/app/v2/_configs/instagram'

export const generateMetadata = ({ params }) => instagramConfig.metadata[params.locale]
export default function Page({ params }) {
  return <PlatformGeneratorPage config={instagramConfig} locale={params.locale} />
}
```

That's the whole route file. The same shape repeats for every platform.

---

## What this prevents

The previous IG and LinkedIn pages were near-clones of each other with hand-edited copy. This causes three failure modes:

1. **Drift.** A change to the FAQ pattern on IG doesn't propagate to LinkedIn. Pages diverge over time.
2. **Layout-platform coupling.** A section that "feels right" on IG (e.g., 3 example post cards in IG-style chrome) gets copy-pasted to LinkedIn and looks awkward, then to TikTok and breaks entirely.
3. **Hidden assumptions.** A tone like "Founder" works great on LinkedIn, weaker on TikTok — but if every page is hand-coded, the assumption never gets tested across the matrix.

The "one template, N configs" pattern forces every layout decision to work for every platform on every locale. **If a section can't be expressed for X (280 chars) or Arabic (RTL), the contract fails at compile time and we see it before shipping.**

---

## Page structure (identical for all platforms, all locales)

1. **Hero teaser.** Cycles through 8 prompt → caption pairs. Visitor sees the tool's output above the fold without authenticating. Replaces the 3-step explainer.
2. **Tone gallery.** 9 tones, same product, side-by-side captions. The visitor sees voice control demonstrated, not described.
3. **Caption anatomy.** One generated caption with annotations on hook, body, kicker, hashtag strategy, emoji rhythm. Teaches what makes the caption work.
4. **FAQ.** 5 platform-specific Q&A.
5. **CTA.** Single end-of-page banner.

No "How it works." No 4-feature checkmark grid. No testimonials block. If you find yourself wanting one, it goes on the homepage, not on a platform page.

---

## File layout

```
app/v2/
  _components/
    platform-generator-page.tsx   The template. Takes config + locale.
    hero-teaser.tsx                Cycling prompt → caption.
    tone-gallery.tsx               9-tone grid (3×3 desktop, stacked mobile).
    caption-anatomy.tsx            Annotated caption.
    platform-mockup.tsx            Native UI chrome (IG card, LI card, X card, FB card, TikTok card).
    platform-faq.tsx               Accordion.
    platform-cta.tsx               End banner.
    locale-switcher.tsx            Dropdown in header.
  _configs/
    types.ts                       PlatformConfig interface.
    tones.ts                       Canonical 9 tones.
    locales.ts                     6 languages + RTL flag.
    instagram.ts                   Full content.
    linkedin.ts                    Full content.
    facebook.ts                    Stub for next session.
    tiktok.ts                      Stub.
    x.ts                           Stub.
  _i18n/
    dictionaries.ts                UI strings per locale (header labels, "Coming soon", etc.)
    direction.ts                   LTR/RTL helper.
  [locale]/
    ai-instagram-post-generator/page.tsx
    ai-linkedin-post-generator/page.tsx
    ai-facebook-post-generator/page.tsx       (Coming soon placeholder)
    ai-tiktok-post-generator/page.tsx          (Coming soon placeholder)
    ai-x-post-generator/page.tsx               (Coming soon placeholder)
  layout.tsx                       Adds noindex meta to all v2 routes.
```

`Klinchapp V2/` (this folder) sits at repo root and is the source of truth for design decisions. Code in `app/v2/` should not duplicate documentation — it should refer back here.

---

## Locale routing

**Path-prefix inside the v2 namespace:** `/v2/<locale>/<platform-slug>`.

The `[locale]` dynamic segment is INSIDE `/v2/`, not at the root. Reason: putting `[locale]` at the root would catch every existing route on the live site (`/blog`, `/dashboard`, `/contact`, etc.) and require migrating them all to `app/[locale]/...`. That's a separate task from this redesign. Containing locale within `/v2/` lets us experiment without disturbing the live site.

When v2 is approved and promoted to canonical, full-site i18n migration is a follow-up task tracked in `decisions-log.md`.

### URL shape

| Locale | URL |
|--------|-----|
| English | `/v2/en/ai-instagram-post-generator` |
| Spanish | `/v2/es/ai-instagram-post-generator` |
| Portuguese | `/v2/pt/ai-instagram-post-generator` |
| French | `/v2/fr/ai-instagram-post-generator` |
| Arabic | `/v2/ar/ai-instagram-post-generator` |
| Hindi | `/v2/hi/ai-instagram-post-generator` |

Every page emits `<link rel="alternate" hreflang="es" href="/v2/es/...">` for all 6 locales. `hreflang="x-default"` points to English.

---

## RTL handling

Arabic (`ar`) flips the entire page direction. The template reads the locale's `direction` flag from `_configs/locales.ts` and sets `dir="rtl"` on the root `<div>`.

Components use Tailwind's logical properties (`ms-*` for margin-start, `me-*` for margin-end, `ps-*`, `pe-*`) instead of left/right (`ml-*`, `mr-*`) where direction matters. The locale switcher and header layout flip cleanly. Arrows in CTAs (`→`) get swapped for `←` in RTL via the dictionary.

---

## Adding a new platform

1. Create `app/v2/_configs/<platform>.ts` exporting a `PlatformConfig` object satisfying `types.ts`.
2. Create `app/v2/[locale]/ai-<platform>-post-generator/page.tsx` (4-line passthrough).
3. The template handles everything else.

If the new platform reveals a layout assumption that doesn't fit (e.g., TikTok captions are too short for caption anatomy), **fix the template** and document the change in `decisions-log.md` — every existing platform page benefits.

---

## Adding a new language

1. Add the locale code, name, and direction flag to `app/v2/_configs/locales.ts`.
2. For each platform config, add the locale's content to the `Record<Locale, ...>` maps.
3. Add UI string translations to `app/v2/_i18n/dictionaries.ts`.

Locales with missing content fall back to English with a "Coming soon" badge.

---

## What lives where

| Decision | File |
|----------|------|
| Tone definitions | `_configs/tones.ts` |
| Locale list + RTL flags | `_configs/locales.ts` |
| Platform char limits, slugs | `_configs/<platform>.ts` |
| UI strings (header, CTA labels, badges) | `_i18n/dictionaries.ts` |
| Visual identity (colors, gradients) | `tailwind.config.ts` (existing project tokens) |
| SEO meta titles/descriptions | per-platform config, per-locale |
| Sample captions / teaser pairs / anatomy | per-platform config, per-locale |

If you're tempted to put content in a component, stop — it goes in a config.
