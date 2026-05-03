# Config Schema

The `PlatformConfig` type is the contract every platform page satisfies. Every field is required — the template can't render without it. If a field is hard to fill for a platform (e.g., hashtag strategy on X), that's a signal that the platform's voice on Klinchapp needs to be defined more carefully, **not that the field should be optional**.

---

## TypeScript shape

```ts
// app/v2/_configs/types.ts
import type { Tone } from './tones'
import type { Locale } from './locales'

export type PlatformId = 'instagram' | 'linkedin' | 'x' | 'facebook' | 'tiktok'

export interface TeaserPair {
  prompt: string         // shown as the visitor's input
  caption: string        // generated output shown in mockup
  hashtags?: string      // platform-dependent
}

export interface ToneCaption {
  caption: string
  hashtags?: string
}

export interface AnatomyAnnotation {
  text: string           // exact substring from caption to highlight
  label: string          // 'Hook', 'Proof', 'Kicker', 'Hashtag stack'
  why: string            // one sentence: why this works on this platform
}

export interface Anatomy {
  caption: string
  annotations: AnatomyAnnotation[]
}

export interface FaqItem {
  q: string
  a: string
}

export interface LocaleMetadata {
  title: string
  description: string
}

export interface GalleryProduct {
  name: string           // 'Saffron & Cedar Candle'
  blurb: string          // 1-line context shown above the gallery
}

export interface PlatformConfig {
  platform: PlatformId
  slug: string                            // 'ai-instagram-post-generator'
  displayName: string                     // 'Instagram'
  charLimit: number                       // matches app/api/generate/route.ts

  metadata:        Record<Locale, LocaleMetadata>
  teaserPairs:     Record<Locale, TeaserPair[]>          // exactly 8
  galleryProduct:  Record<Locale, GalleryProduct>        // same product across platforms
  galleryTones:    Record<Locale, Record<Tone, ToneCaption>>   // 9 captions
  anatomy:         Record<Locale, Anatomy>
  faqs:            Record<Locale, FaqItem[]>             // exactly 5

  /** True when this platform's content is fully written. Stubs render "Coming soon". */
  ready: boolean
}
```

---

## Field-by-field

### `platform`, `slug`, `displayName`

Identifiers and routing. `slug` becomes the URL segment. `displayName` is what visitors see in headings, breadcrumbs, and the locale switcher.

### `charLimit`

Mirrors `getPlatformInstructions` in `app/api/generate/route.ts`. Used by the template for: showing the limit in the UI ("280 character limit"), warning if a hand-written sample caption exceeds it.

| Platform | Char limit |
|----------|-----------|
| Instagram | 2200 |
| LinkedIn | 3000 |
| X | 280 |
| TikTok | 2200 |
| Facebook | 63206 |

### `metadata`

Per-locale `<title>` and `<meta name="description">`. The template merges these with site-wide defaults from `app/layout.tsx` and adds:
- `robots: { index: false, follow: false }` (always — v2 is staging)
- `alternates.canonical` pointing to the v2 URL
- `alternates.languages` listing all 6 locale URLs as hreflang

### `teaserPairs`

**Exactly 8 pairs per locale.** The hero cycles through them with a typewriter effect on the prompt and a fade on the caption.

Writing rules:
- The prompt should sound like something a real visitor would type — short, conversational, product-specific. Not "Generate me an Instagram post about coffee." More like "lavender oat milk latte launch tomorrow."
- The caption must respect the platform's character limit and conventions (hashtag count, emoji density, structure).
- Sample across 8 categories so the rotation doesn't feel repetitive: product launch, behind-the-scenes, milestone, tip, contrarian take, community moment, sale, Q&A.

### `galleryProduct`

**Same product on every platform.** This is intentional — see `architecture.md`. A constant product is the spine of the page; only the platform and tone vary.

The canonical product is defined in `content-guide.md` (Saffron & Cedar candle, Maison Brûlée). All platform configs reference it.

The product must be plausible content for every platform: visual on IG, founder-story on LinkedIn, witty on X, community on Facebook, unboxing on TikTok. If a future product candidate fails any platform, pick a different one.

### `galleryTones`

Per locale, one caption per tone. **9 tones × 6 locales = 54 captions per platform.**

Writing rules:
- Same product, same input — only voice changes.
- Captions must be **visibly** different in voice. If Casual and Friendly read identically, one of them is wrong.
- Match the platform's structure (LinkedIn long-form, X short, etc.) within each tone.
- Hashtag counts respect platform conventions — even when the tone shifts.

The 9 tones are typed (`Tone` union in `tones.ts`). TypeScript will fail the build if a config skips a tone or uses an unknown one.

### `anatomy`

One annotated caption per locale. 3–5 annotations highlighting parts of the caption with a label and a one-sentence rationale.

Writing rules:
- Pick a caption that **deserves** annotation — i.e., where the structure is doing real work. Don't annotate a generic post.
- Each annotation must explain **why this works on this platform**, not just label what it is. "Hook" is a label. "First 7 words must earn the 'see more' click on LinkedIn" is rationale.
- Annotation `text` must be an exact substring of `caption`. The component locates it via `indexOf` to wrap with a highlight span.

### `faqs`

**5 platform-specific Q&A per locale.** Don't reuse the same FAQ across platforms — questions about LinkedIn ("how long should a post be?") are not the same as questions about TikTok ("does Klinchapp suggest sounds?").

Two of the five must be the same on every platform (so visitors get consistent answers about Klinchapp itself):
- "Is Klinchapp free to use?"
- "Will my posts sound like AI?"

The other 3 are platform-specific.

### `ready`

`true` when the config has full content for all 6 locales. `false` for stub configs (FB, TikTok, X this session). Stub pages render a "Coming soon" placeholder using the locale dictionary instead of attempting to render with empty content.

---

## Worked example (truncated)

```ts
// app/v2/_configs/instagram.ts
import type { PlatformConfig } from './types'

export const instagramConfig: PlatformConfig = {
  platform: 'instagram',
  slug: 'ai-instagram-post-generator',
  displayName: 'Instagram',
  charLimit: 2200,
  ready: true,

  metadata: {
    en: {
      title: 'AI Instagram Post Generator | Klinchapp',
      description: 'Generate scroll-stopping Instagram posts with AI...',
    },
    es: { /* ... */ },
    pt: { /* ... */ },
    fr: { /* ... */ },
    ar: { /* ... */ },
    hi: { /* ... */ },
  },

  teaserPairs: {
    en: [
      { prompt: 'lavender oat milk latte for our café opening', caption: '...', hashtags: '#...' },
      // 7 more
    ],
    // 5 more locales
  },

  galleryProduct: {
    en: {
      name: 'Saffron & Cedar Candle — Maison Brûlée',
      blurb: 'Same product. Same input. 9 voices.',
    },
    // 5 more locales
  },

  galleryTones: {
    en: {
      professional: { caption: '...', hashtags: '...' },
      casual:       { caption: '...', hashtags: '...' },
      enthusiastic: { caption: '...', hashtags: '...' },
      humorous:     { caption: '...', hashtags: '...' },
      inspirational:{ caption: '...', hashtags: '...' },
      luxe:         { caption: '...', hashtags: '...' },
      witty:        { caption: '...', hashtags: '...' },
      founder:      { caption: '...', hashtags: '...' },
      bold:         { caption: '...', hashtags: '...' },
    },
    // 5 more locales
  },

  anatomy: {
    en: {
      caption: '...',
      annotations: [
        { text: '...', label: 'Hook', why: '...' },
        { text: '...', label: 'Proof', why: '...' },
        { text: '...', label: 'Hashtag stack', why: '...' },
      ],
    },
    // 5 more locales
  },

  faqs: {
    en: [
      { q: 'Is Klinchapp free to use?', a: '...' },
      { q: 'Will my Instagram captions sound like AI?', a: '...' },
      { q: 'How many hashtags should an Instagram post have?', a: '...' },
      { q: 'Does Klinchapp generate hashtags too?', a: '...' },
      { q: 'Can I customize the tone of my Instagram captions?', a: '...' },
    ],
    // 5 more locales
  },
}
```

---

## Stub config example

```ts
// app/v2/_configs/tiktok.ts
import type { PlatformConfig } from './types'
import { stubLocaleMap } from './stub-helpers'

export const tiktokConfig: PlatformConfig = {
  platform: 'tiktok',
  slug: 'ai-tiktok-post-generator',
  displayName: 'TikTok',
  charLimit: 2200,
  ready: false,

  metadata:       stubLocaleMap.metadata,
  teaserPairs:    stubLocaleMap.teaserPairs,
  galleryProduct: stubLocaleMap.galleryProduct,
  galleryTones:   stubLocaleMap.galleryTones,
  anatomy:        stubLocaleMap.anatomy,
  faqs:           stubLocaleMap.faqs,
}
```

The stub helper returns minimal placeholder objects that satisfy the type system. The template checks `config.ready` and renders a "Coming soon" page if `false`, so stub content is never displayed.
