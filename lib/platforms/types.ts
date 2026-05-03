// Platform page config — one shape, drives all 5 platform pages.
// Used by app/components/platform-page.tsx + each app/ai-{platform}-{post|caption}-generator/page.tsx route.

export type PlatformSlug = 'instagram' | 'linkedin' | 'twitter' | 'facebook' | 'tiktok'

export type ToneKey =
  | 'professional'
  | 'casual'
  | 'enthusiastic'
  | 'humorous'
  | 'inspirational'
  | 'luxe'
  | 'witty'
  | 'founder'
  | 'bold'

export type SampleCard = {
  /** Path under /public — e.g. /v2-mockup/cafe.png. Line-art purple style only. */
  image: string
  /** Descriptive alt text for SEO + a11y. Should mention "AI-generated", platform, product type, voice. */
  imageAlt: string
  /** Display label for the tone shown above the caption. */
  toneLabel: string
  /** The actual generated caption — kept short and credible. */
  caption: string
  /** 5–10 hashtags (Instagram). Other platforms will use fewer. */
  hashtags: string[]
  /** True character count for caption + hashtags joined with spaces. */
  charCount: number
  /** Platform character limit (matches app/api/generate/route.ts). */
  charLimit: number
}

export type BestPractice = {
  title: string
  body: string
}

export type FAQItem = {
  q: string
  a: string
}

export type PlatformConfig = {
  slug: PlatformSlug
  /** URL slug, e.g. "ai-instagram-post-generator". */
  routePath: string
  /** Display name, e.g. "Instagram". */
  name: string
  /** SEO. */
  metaTitle: string
  metaDescription: string

  hero: {
    /** Small line above the big H1 line. */
    h1Top: string
    /** The big brand-purple H1 line — platform-specific value prop. */
    h1Bottom: string
    /** One honest line under the H1. */
    sub: string
    ctaLabel: string
  }

  /** Three sample posts shown as native-style cards. Use all 3 product images. */
  samples: [SampleCard, SampleCard, SampleCard]

  /** "What makes a good [Platform] post + how Klinchapp writes it" — 3 columns. */
  bestPractices: [BestPractice, BestPractice, BestPractice]

  /** Same caption rendered in 3 languages — EN, ES, AR (RTL preview). */
  languageSamples: {
    en: string
    es: string
    ar: string
  }

  /** 6 FAQ items. Schema.org FAQ markup is emitted from these. */
  faqs: FAQItem[]
}
