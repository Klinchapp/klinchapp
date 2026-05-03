import type { PlatformConfig } from './types'

export const instagramConfig: PlatformConfig = {
  slug: 'instagram',
  routePath: 'ai-instagram-post-generator',
  name: 'Instagram',

  metaTitle: 'AI Instagram Post Generator | Captions, Hashtags, Voice — Klinchapp',
  metaDescription:
    'Generate Instagram posts with AI. Upload your product, pick a voice, get captions and hashtags in seconds. 9 voices · 6 languages · Free plan, no credit card.',

  hero: {
    h1Top: 'AI Instagram Post Generator.',
    h1Bottom: 'Captions, hashtags, voice — in seconds.',
    sub: '9 voices · 6 languages · Free plan, no credit card required.',
    ctaLabel: 'Start Creating Free',
  },

  samples: [
    {
      image: '/v2-mockup/cafe.png',
      imageAlt: 'AI-generated Instagram caption for a coffee shop product, written in a casual voice',
      toneLabel: 'Casual',
      caption:
        'New oat milk lavender latte just landed. Made for slow Mondays and unhurried mornings.',
      hashtags: [
        '#SpecialtyCoffee',
        '#OatMilkLatte',
        '#MorningRitual',
        '#LocalCafe',
        '#LavenderLatte',
      ],
      charCount: 175,
      charLimit: 2200,
    },
    {
      image: '/v2-mockup/linen-dress.png',
      imageAlt: 'AI-generated Instagram post for a linen dress, written in a luxe voice',
      toneLabel: 'Luxe',
      caption:
        'Heirloom linen, hand-finished. The dress that makes everything feel deliberate.',
      hashtags: [
        '#SlowFashion',
        '#LinenDress',
        '#TimelessStyle',
        '#MadeToLast',
        '#QuietLuxury',
      ],
      charCount: 162,
      charLimit: 2200,
    },
    {
      image: '/v2-mockup/vitamin-c-serum.png',
      imageAlt: 'AI-generated Instagram caption for a Vitamin C serum, written in a witty voice',
      toneLabel: 'Witty',
      caption:
        'Vitamin C: not just for orange juice. Brighter skin in 7 days, no juicer required.',
      hashtags: [
        '#VitaminC',
        '#SkincareThatWorks',
        '#GlowUp',
        '#CleanBeauty',
        '#7DayGlow',
      ],
      charCount: 163,
      charLimit: 2200,
    },
  ],

  bestPractices: [
    {
      title: 'Visual-first captions',
      body:
        "Your image does the heavy lifting on Instagram. Klinchapp writes captions that complement what people are already looking at — they don't repeat the picture in words.",
    },
    {
      title: '5–10 well-chosen hashtags',
      body:
        'Instagram rewards relevance over volume. Klinchapp suggests 5–10 hashtags tuned to your niche, your product category, and the audiences that actually engage.',
    },
    {
      title: 'Emojis with intent',
      body:
        'Used sparingly, emojis lift readability and personality. Used everywhere, they read as noise. Klinchapp picks two to four that fit the post — no decoration for its own sake.',
    },
  ],

  languageSamples: {
    en: 'New oat milk lavender latte just landed. Made for slow Mondays and unhurried mornings.',
    es: 'Acaba de llegar nuestro nuevo latte de avena con lavanda. Hecho para los lunes lentos y las mañanas sin prisas.',
    ar: 'وصل للتو لاتيه اللافندر بحليب الشوفان. مصنوع لأيام الاثنين الهادئة والصباحات المتمهلة.',
  },

  faqs: [
    {
      q: "I don't have a website — can I still use Klinchapp for Instagram?",
      a: "Yes. You don't need a website. Upload a product image, choose Instagram, pick a voice, and Klinchapp generates the post — caption, hashtags, and CTA included.",
    },
    {
      q: 'What is an AI Instagram post generator?',
      a: 'It writes Instagram captions and hashtag sets for your posts using AI. Klinchapp learns from your product image and the tone you select, then generates a post you can publish — caption, emojis, hashtags, and CTA included.',
    },
    {
      q: 'How many hashtags should I use on Instagram?',
      a: 'Five to ten relevant hashtags outperforms hashtag-stuffed posts on most accounts. Klinchapp suggests in that range by default and lets you swap any of them.',
    },
    {
      q: 'Will my Instagram captions sound like AI?',
      a: "No — Klinchapp learns your tone from the voice you pick (nine to choose from) and from the product itself. Edit, regenerate, or fine-tune anything before posting. You stay in control of the final post.",
    },
    {
      q: 'Can I generate Instagram posts in other languages?',
      a: 'Yes. Klinchapp generates in English, Spanish, Portuguese, French, Arabic (right-to-left), and Hindi. Hashtags and emojis are localized too — not just the caption.',
    },
    {
      q: 'Is it really free?',
      a: 'The free plan covers 60 AI-generated posts per month across all five platforms — Instagram, LinkedIn, X, Facebook, TikTok. No credit card required to start.',
    },
  ],
}
