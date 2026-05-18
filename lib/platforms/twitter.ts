import type { PlatformConfig } from './types'

// Brand uses "X" but slug + path use "twitter" because that's still the active search query.
export const twitterConfig: PlatformConfig = {
  slug: 'twitter',
  routePath: 'ai-twitter-post-generator',
  name: 'X',

  metaTitle: 'AI X Post Generator | Punchy Posts Under 280',
  metaDescription:
    'Generate X posts with AI. Upload a product, pick a voice, get punchy posts under 280 characters. 9 voices · 6 languages · Free plan, no card.',

  hero: {
    h1Top: 'AI X Post Generator',
    h1Bottom: 'Punchy posts under 280 — in seconds.',
    sub: '9 voices · 6 languages · Free plan, no credit card required.',
    ctaLabel: 'Start Creating Free',
  },

  samples: [
    {
      image: '/v2-mockup/cafe.png',
      imageAlt: 'AI-generated X post for a coffee shop, written in a witty voice',
      toneLabel: 'Witty',
      caption:
        'Just launched: oat milk lavender latte. Now 17% of our morning customers stand still long enough to notice the menu. Progress.',
      hashtags: ['#SpecialtyCoffee'],
      charCount: 142,
      charLimit: 280,
    },
    {
      image: '/v2-mockup/linen-dress.png',
      imageAlt: 'AI-generated X post for a linen dress brand, written in a bold voice',
      toneLabel: 'Bold',
      caption: "Heirloom linen. No fast fashion. No 'inspired by'. Just the dress your mother kept.",
      hashtags: ['#SlowFashion'],
      charCount: 97,
      charLimit: 280,
    },
    {
      image: '/v2-mockup/vitamin-c-serum.png',
      imageAlt: 'AI-generated X post for a Vitamin C serum, written in a casual voice',
      toneLabel: 'Casual',
      caption:
        "got 'why didn't you tell me about this sooner' as a reply to our last skincare drop. we're framing it.",
      hashtags: ['#SkincareThatWorks'],
      charCount: 122,
      charLimit: 280,
    },
  ],

  bestPractices: [
    {
      title: 'Under 280 characters, no exceptions',
      body:
        "X hard-caps at 280 characters including hashtags. Klinchapp generates within the limit every time — no truncation, no overflow, no posts that get cut off mid-sentence.",
    },
    {
      title: 'One clear idea per post',
      body:
        'X rewards punchy single-thought posts over rambling threads. Klinchapp keeps each generated post to one sharp claim or observation — the kind that gets quoted.',
    },
    {
      title: '1–2 hashtags, no stacking',
      body:
        'Hashtag stacks read as spam on X. Klinchapp picks one or two relevant tags and stops there. The post does the work; the hashtag just helps it find an audience.',
    },
  ],

  languageSamples: {
    en: 'Just launched: oat milk lavender latte. Now 17% of our morning customers stand still long enough to notice the menu. Progress.',
    es: 'Acaba de salir: latte de avena con lavanda. Ahora el 17% de los clientes de la mañana se queda quieto el tiempo suficiente para mirar el menú. Progreso.',
    ar: 'أُطلق للتو: لاتيه اللافندر بحليب الشوفان. الآن 17% من زبائن الصباح يقفون مدّة كافية ليلاحظوا قائمة الطعام. تقدّم.',
  },

  faqs: [
    {
      q: "I don't have a website — can I still use Klinchapp for X?",
      a: "Yes. You don't need a website. Upload a product image, choose X, pick a voice, and Klinchapp generates the post — under 280 characters, hashtags included.",
    },
    {
      q: 'What is an AI X post generator?',
      a: 'It writes X (Twitter) posts using AI — under 280 characters, on-brand, with one clear hook. Klinchapp learns your voice and product, then drafts a post tight enough to ship.',
    },
    {
      q: 'How does Klinchapp stay under 280 characters?',
      a: "Every X post is generated with the 280-character cap as a hard constraint. Klinchapp counts characters as it writes — including hashtags and emojis — so posts are never truncated mid-sentence.",
    },
    {
      q: 'Will my X posts sound like AI?',
      a: 'No — Klinchapp learns your tone from the voice you pick (nine to choose from, including Witty, Bold, and Casual) and from the product itself. Edit or regenerate any post before publishing.',
    },
    {
      q: 'Can I generate X posts in other languages?',
      a: 'Yes. Klinchapp generates in English, Spanish, Portuguese, French, Arabic (right-to-left), and Hindi. The 280-character cap applies in every language.',
    },
    {
      q: 'Is it really free?',
      a: 'The free plan covers 60 AI-generated posts per month across all five platforms — Instagram, LinkedIn, X, Facebook, TikTok. No credit card required to start.',
    },
  ],
}
