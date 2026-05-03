import type { PlatformConfig } from './types'

export const linkedinConfig: PlatformConfig = {
  slug: 'linkedin',
  routePath: 'ai-linkedin-post-generator',
  name: 'LinkedIn',

  metaTitle: 'AI LinkedIn Post Generator | Hooks, Structure, Voice — Klinchapp',
  metaDescription:
    'Generate LinkedIn posts with AI. Upload a product, pick a voice, get hooks that earn the click. 9 voices · 6 languages · Free plan, no credit card.',

  hero: {
    h1Top: 'AI LinkedIn Post Generator.',
    h1Bottom: 'Hooks, structure, voice — in seconds.',
    sub: '9 voices · 6 languages · Free plan, no credit card required.',
    ctaLabel: 'Start Creating Free',
  },

  samples: [
    {
      image: '/v2-mockup/cafe.png',
      imageAlt: 'AI-generated LinkedIn post for a specialty coffee brand, written in a professional voice',
      toneLabel: 'Professional',
      caption: `We changed coffee suppliers last month. Same farms, shorter chain, fairer cut for the growers.

The latte tastes the same. The numbers don't.

If you're sourcing for a cafe, the question isn't "what's cheapest" — it's "who's getting paid".`,
      hashtags: ['#SpecialtyCoffee', '#FairTrade', '#SmallBusiness'],
      charCount: 283,
      charLimit: 3000,
    },
    {
      image: '/v2-mockup/linen-dress.png',
      imageAlt: 'AI-generated LinkedIn post for a linen dress brand, written in a founder voice',
      toneLabel: 'Founder',
      caption: `Three years ago I started this brand because I couldn't find a linen dress that lasted more than one summer.

Now we make one. It's not cheap. It's not seasonal. It's the dress my mother kept for fifteen years.

We just released the third batch.`,
      hashtags: ['#SlowFashion', '#FemaleFounder', '#MadeToLast'],
      charCount: 287,
      charLimit: 3000,
    },
    {
      image: '/v2-mockup/vitamin-c-serum.png',
      imageAlt: 'AI-generated LinkedIn post for a Vitamin C serum brand, written in a bold voice',
      toneLabel: 'Bold',
      caption: `Most Vitamin C serums oxidise within weeks. Ours uses a stabilized form that doesn't.

Clinical study, 60 participants, 7 days: 73% measured visibly brighter skin.

We're not selling hope. We're selling the molecule that actually works.`,
      hashtags: ['#Skincare', '#FormulationScience', '#CleanBeauty'],
      charCount: 278,
      charLimit: 3000,
    },
  ],

  bestPractices: [
    {
      title: 'Hook in the first two lines',
      body:
        "LinkedIn shows the first one or two lines before the 'see more' fold. Klinchapp leads with a counterintuitive line, a real number, or a sharp question — the part that earns the click.",
    },
    {
      title: 'Line breaks for scanability',
      body:
        'Dense paragraphs lose readers in the LinkedIn feed. Klinchapp uses short lines and white space — the same shape that performs in the algorithm and reads well on phones.',
    },
    {
      title: '2–3 hashtags, professionally relevant',
      body:
        "LinkedIn isn't Instagram. Klinchapp suggests two or three hashtags tied to your industry and topic — not a stack. Quality of tag beats quantity here.",
    },
  ],

  languageSamples: {
    en: 'We changed coffee suppliers last month. Same farms, shorter chain, fairer cut for the growers. The latte tastes the same. The numbers don\'t.',
    es: 'Cambiamos de proveedor de café el mes pasado. Mismas fincas, cadena más corta, mejor reparto para los productores. El café sabe igual. Los números no.',
    ar: 'غيّرنا مورّد القهوة الشهر الماضي. نفس المزارع، سلسلة أقصر، نصيب أعدل للمزارعين. اللاتيه نفسه. الأرقام مختلفة.',
  },

  faqs: [
    {
      q: "I don't have a website — can I still use Klinchapp for LinkedIn?",
      a: "Yes. You don't need a website. Upload a product image, choose LinkedIn, pick a voice, and Klinchapp generates the post — hook, body, and closing line included.",
    },
    {
      q: 'What is an AI LinkedIn post generator?',
      a: "It writes LinkedIn posts using AI — hook, body, and closing line — tailored to how the LinkedIn feed actually rewards content. Klinchapp learns your tone and angle, then drafts a post you can ship.",
    },
    {
      q: 'How long should a LinkedIn post be?',
      a: 'LinkedIn rewards posts that earn the click on "see more" — usually 150–300 words with a strong hook in the first one or two lines. Klinchapp drafts to that shape by default and lets you adjust length and structure.',
    },
    {
      q: 'Will my LinkedIn posts sound like AI?',
      a: 'No — Klinchapp learns your tone from the voice you pick (nine to choose from, including Professional, Founder, and Bold) and from the product itself. Edit, regenerate, or fine-tune the hook before publishing. You stay in control.',
    },
    {
      q: 'Can I generate LinkedIn posts in other languages?',
      a: 'Yes. Klinchapp generates in English, Spanish, Portuguese, French, Arabic (right-to-left), and Hindi. Hashtags are localized too — not just the caption.',
    },
    {
      q: 'Is it really free?',
      a: 'The free plan covers 60 AI-generated posts per month across all five platforms — Instagram, LinkedIn, X, Facebook, TikTok. No credit card required to start.',
    },
  ],
}
