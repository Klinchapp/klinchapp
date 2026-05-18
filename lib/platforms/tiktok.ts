import type { PlatformConfig } from './types'

export const tiktokConfig: PlatformConfig = {
  slug: 'tiktok',
  // "caption-generator" matches the existing convention (TikTok captions go under videos).
  routePath: 'ai-tiktok-caption-generator',
  name: 'TikTok',

  metaTitle: 'AI TikTok Caption Generator | Trendy Captions, Viral Hashtags',
  metaDescription:
    'Generate TikTok captions with AI. Upload a product, pick a voice, get trendy captions and viral hashtags. 9 voices · 6 languages · Free plan.',

  hero: {
    h1Top: 'AI TikTok Caption Generator',
    h1Bottom: 'Trendy captions and hashtags — in seconds.',
    sub: '9 voices · 6 languages · Free plan, no credit card required.',
    ctaLabel: 'Start Creating Free',
  },

  samples: [
    {
      image: '/v2-mockup/cafe.png',
      imageAlt: 'AI-generated TikTok caption for a coffee shop product, written in a humorous voice',
      toneLabel: 'Humorous',
      caption: "POV: oat milk lavender latte just dropped and your friend group chat hasn't stopped",
      hashtags: ['#cafetok', '#coffeetiktok', '#fyp', '#oatmilklatte'],
      charCount: 126,
      charLimit: 2200,
    },
    {
      image: '/v2-mockup/linen-dress.png',
      imageAlt: 'AI-generated TikTok caption for a linen dress, written in a bold voice',
      toneLabel: 'Bold',
      caption:
        'the dress your grandma had. but new. but actually 100% linen. but also the only one in your size left.',
      hashtags: ['#slowfashion', '#linenseason', '#fyp', '#fashiontok'],
      charCount: 145,
      charLimit: 2200,
    },
    {
      image: '/v2-mockup/vitamin-c-serum.png',
      imageAlt: 'AI-generated TikTok caption for a Vitamin C serum, written in an enthusiastic voice',
      toneLabel: 'Enthusiastic',
      caption: '7 day glow check incoming ✨ vitamin C serum doing the thing',
      hashtags: ['#skincaretiktok', '#glowup', '#vitamincserum', '#fyp', '#7dayskinchallenge'],
      charCount: 124,
      charLimit: 2200,
    },
  ],

  bestPractices: [
    {
      title: 'Trendy phrasing, Gen-Z voice',
      body:
        "TikTok captions are a different language. Klinchapp uses 'POV:', 'tell me without telling me', and other native formats when the tone calls for it — without sounding like a brand trying too hard.",
    },
    {
      title: '3–5 viral hashtags',
      body:
        'Mix niche plus broad — your category tag plus #fyp or #foryoupage. Klinchapp suggests three to five tags automatically, balancing discoverability and relevance.',
    },
    {
      title: 'Short caption, video does the work',
      body:
        'TikTok captions support the video, they don\'t compete with it. Klinchapp writes 50–150 character captions tuned for hook-and-pause — the kind that get someone to stop scrolling.',
    },
  ],

  languageSamples: {
    en: "POV: oat milk lavender latte just dropped and your friend group chat hasn't stopped",
    es: 'POV: acaba de salir el latte de avena con lavanda y el grupo de WhatsApp no se calla',
    ar: 'POV: لاتيه اللافندر بحليب الشوفان نزل للتو وقروب الأصدقاء ما سكت',
  },

  faqs: [
    {
      q: 'Klinchapp writes captions, not videos — right?',
      a: "Right. Klinchapp generates the caption and hashtag set for your TikTok post — what goes under the video. You film and edit the video itself; Klinchapp handles the words around it.",
    },
    {
      q: 'What is an AI TikTok caption generator?',
      a: "It writes TikTok captions and hashtag sets using AI — short, trendy, and tuned to TikTok's native phrasing. Klinchapp learns from your product image and voice, then drafts the caption.",
    },
    {
      q: 'How many hashtags should a TikTok caption have?',
      a: "Three to five works best — a mix of niche tags (your category) and broad tags like #fyp. Klinchapp suggests in that range automatically and lets you swap any of them.",
    },
    {
      q: 'Will my TikTok captions sound like AI?',
      a: "No — Klinchapp learns your tone from the voice you pick (nine to choose from, including Humorous, Bold, and Enthusiastic) and uses TikTok-native phrasing. Edit or regenerate before posting.",
    },
    {
      q: 'Can I generate TikTok captions in other languages?',
      a: 'Yes. Klinchapp generates in English, Spanish, Portuguese, French, Arabic (right-to-left), and Hindi. Hashtag conventions are localized too.',
    },
    {
      q: 'Is it really free?',
      a: 'The free plan covers 60 AI-generated posts per month across all five platforms — Instagram, LinkedIn, X, Facebook, TikTok. No credit card required to start.',
    },
  ],
}
