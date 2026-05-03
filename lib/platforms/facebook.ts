import type { PlatformConfig } from './types'

export const facebookConfig: PlatformConfig = {
  slug: 'facebook',
  routePath: 'ai-facebook-post-generator',
  name: 'Facebook',

  metaTitle: 'AI Facebook Post Generator | Conversational Posts That Earn Comments — Klinchapp',
  metaDescription:
    'Generate Facebook posts with AI. Upload a product, pick a voice, get posts that earn comments. 9 voices · 6 languages · Free plan, no credit card.',

  hero: {
    h1Top: 'AI Facebook Post Generator.',
    h1Bottom: 'Conversational posts that earn comments.',
    sub: '9 voices · 6 languages · Free plan, no credit card required.',
    ctaLabel: 'Start Creating Free',
  },

  samples: [
    {
      image: '/v2-mockup/cafe.png',
      imageAlt: 'AI-generated Facebook post for a coffee shop, written in an enthusiastic voice',
      toneLabel: 'Enthusiastic',
      caption: `Coffee people — we did the thing 🌿

The oat milk lavender latte we've been testing for three weeks just hit the menu, and honestly it's our new favorite. Soft floral notes, creamy without being heavy, and pairs ridiculously well with our chocolate cardamom cookie.

If you try it, tell us what you think. We genuinely want to know.`,
      hashtags: ['#LocalCafe'],
      charCount: 341,
      charLimit: 63206,
    },
    {
      image: '/v2-mockup/linen-dress.png',
      imageAlt: 'AI-generated Facebook post for a linen dress brand, written in a casual voice',
      toneLabel: 'Casual',
      caption: `Anyone else moving everything in their wardrobe to linen this season? We just released our 100% Belgian linen dress in three new colors and the response has been wild.

Best part: it actually gets better the more you wear it. Every wash makes it softer.

What's your go-to summer fabric — linen, cotton, or something else?`,
      hashtags: [],
      charCount: 322,
      charLimit: 63206,
    },
    {
      image: '/v2-mockup/vitamin-c-serum.png',
      imageAlt: 'AI-generated Facebook post for a Vitamin C serum, written in an inspirational voice',
      toneLabel: 'Inspirational',
      caption: `Skincare isn't vanity — it's how some of us start the day feeling like we've taken care of ourselves before the world starts asking.

Our Vitamin C serum was designed for that morning ritual. Brighter skin in 7 days. But more importantly: a moment that's yours.

What does your morning ritual look like?`,
      hashtags: ['#MorningRoutine'],
      charCount: 319,
      charLimit: 63206,
    },
  ],

  bestPractices: [
    {
      title: 'Conversational tone, with a question',
      body:
        "Facebook's algorithm rewards posts that drive comments — not just likes. Klinchapp closes with a real question that invites replies, the kind people actually answer.",
    },
    {
      title: 'Image first, text supports',
      body:
        'Facebook surfaces image-led posts higher than text-only ones. Klinchapp writes copy that complements the image — short, scannable, and on-brand — instead of competing with it.',
    },
    {
      title: 'Minimal hashtags',
      body:
        "Facebook doesn't reward hashtag-heavy posts the way Instagram does. Klinchapp keeps it to zero or one — the platform is built around groups, comments, and shares, not tags.",
    },
  ],

  languageSamples: {
    en: "Anyone else moving everything in their wardrobe to linen this season? Best part: it actually gets better the more you wear it.",
    es: '¿Alguien más está pasando todo su armario al lino esta temporada? Lo mejor: en realidad mejora cuanto más lo usas.',
    ar: 'هل ينقل أحد آخر كل خزانته إلى الكتان هذا الموسم؟ الأفضل: يتحسّن فعلاً كلما لبستِه أكثر.',
  },

  faqs: [
    {
      q: "I don't have a website — can I still use Klinchapp for Facebook?",
      a: "Yes. You don't need a website. Upload a product image, choose Facebook, pick a voice, and Klinchapp generates the post — body and a comment-prompt closing line included.",
    },
    {
      q: 'What is an AI Facebook post generator?',
      a: "It writes Facebook posts using AI — conversational, image-led, and tuned to drive comments rather than just likes. Klinchapp learns your voice and product, then drafts the post.",
    },
    {
      q: 'Should I use hashtags on Facebook?',
      a: "Sparingly or not at all. Facebook's algorithm doesn't reward hashtag-heavy posts the way Instagram does. Klinchapp suggests zero to one hashtag per post by default.",
    },
    {
      q: 'Will my Facebook posts sound like AI?',
      a: 'No — Klinchapp learns your tone from the voice you pick (nine to choose from, including Enthusiastic, Casual, and Inspirational) and from the product itself. Edit or regenerate before posting.',
    },
    {
      q: 'Can I generate Facebook posts in other languages?',
      a: 'Yes. Klinchapp generates in English, Spanish, Portuguese, French, Arabic (right-to-left), and Hindi.',
    },
    {
      q: 'Is it really free?',
      a: 'The free plan covers 60 AI-generated posts per month across all five platforms — Instagram, LinkedIn, X, Facebook, TikTok. No credit card required to start.',
    },
  ],
}
