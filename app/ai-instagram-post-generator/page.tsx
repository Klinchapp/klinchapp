import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '../components/site-header'
import SiteFooter from '../components/site-footer'

export const metadata: Metadata = {
  title: 'AI Instagram Post Generator | Create Captions in Seconds',
  description: 'Generate scroll-stopping Instagram posts with AI. Upload your product, get on-brand captions and hashtags in seconds. Free plan — no credit card required.',
  alternates: {
    canonical: 'https://www.klinchapp.com/ai-instagram-post-generator',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.klinchapp.com/ai-instagram-post-generator',
    siteName: 'Klinchapp',
    title: 'AI Instagram Post Generator — Klinchapp',
    description: 'Generate scroll-stopping Instagram posts with AI. Captions, hashtags, and brand voice — in seconds.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Klinchapp AI Instagram Post Generator' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Instagram Post Generator — Klinchapp',
    description: 'Generate scroll-stopping Instagram posts with AI. Captions, hashtags, and brand voice — in seconds.',
    images: ['/og-image.png'],
  },
}

const faqs = [
  {
    q: 'What is an AI Instagram post generator?',
    a: 'It\'s a tool that uses AI to write Instagram captions, suggest hashtags, and tailor your content for the Instagram feed. Klinchapp analyses your product image and your brand voice, then generates a post you can share — caption, emoji, hashtags, and CTA included.',
  },
  {
    q: 'Is Klinchapp free to use?',
    a: 'Yes. The free plan includes 60 AI-generated posts per month across Instagram, LinkedIn, Twitter, Facebook, and TikTok. No credit card required to start.',
  },
  {
    q: 'Will my Instagram captions sound like AI?',
    a: 'No — that\'s the point. Klinchapp learns your brand voice from your product and the tone you select, so captions read like a thoughtful in-house copywriter wrote them. You stay in control: edit, regenerate, or fine-tune before posting.',
  },
  {
    q: 'Does Klinchapp generate hashtags?',
    a: 'Yes. Every Instagram post comes with hashtag suggestions tuned to your niche and product. You can keep them, swap them, or generate a fresh set with one click.',
  },
  {
    q: 'How many Instagram posts can I generate?',
    a: 'The free plan covers 60 posts per month across all platforms. Paid plans unlock unlimited generation and additional brand voices for teams.',
  },
  {
    q: 'Can I customize the tone of my Instagram captions?',
    a: 'Yes. Choose from playful, professional, luxe, friendly, witty, and more — or define your own brand voice. Klinchapp keeps the tone consistent across every caption you generate.',
  },
]

const samplePosts = [
  {
    handle: 'rosewoodcafe',
    brandLabel: 'Rosewood Café',
    image: 'linear-gradient(135deg, #d4a574 0%, #8b5a2b 50%, #5d3a1a 100%)',
    imageEmoji: '☕',
    accentEmojis: ['☕', '🤎', '✨', '☕'],
    caption: 'Mornings just got better ☕ Our new oat milk lavender latte is here — handcrafted, locally sourced, and made to make Mondays bearable.',
    hashtags: '#LavenderLatte #OatMilk #SpecialtyCoffee #LocalCafe #MorningRitual',
  },
  {
    handle: 'lumiereskincare',
    brandLabel: 'Lumière',
    image: 'linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 50%, #ec4899 100%)',
    imageEmoji: '✨',
    accentEmojis: ['💧', '✨', '🌸', '✨'],
    caption: 'Glow doesn\'t happen overnight — except when it does ✨ Our new Vitamin C serum delivers brighter skin in 7 days. Backed by science, formulated for sensitive skin.',
    hashtags: '#VitaminCSerum #CleanBeauty #GlowUp #SkincareRoutine #SensitiveSkin',
  },
  {
    handle: 'maisonlinen',
    brandLabel: 'Maison Linen',
    image: 'linear-gradient(135deg, #e7f0d9 0%, #a8c89e 50%, #6b8e5a 100%)',
    imageEmoji: '🌿',
    accentEmojis: ['🌿', '☀️', '🌾', '🌿'],
    caption: 'Made to breathe, designed to wander 🌿 Our linen midi dresses are back in stock — soft, sustainable, and effortlessly summer.',
    hashtags: '#LinenDress #SustainableFashion #SummerStyle #SlowFashion #Boutique',
  },
]

const accentPositions = [
  'top-5 left-6 text-3xl opacity-40 -rotate-12',
  'top-10 right-8 text-2xl opacity-30 rotate-12',
  'bottom-14 left-10 text-2xl opacity-30 -rotate-6',
  'bottom-6 right-7 text-3xl opacity-40 rotate-6',
]

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Klinchapp — AI Instagram Post Generator',
  applicationCategory: 'SocialMediaMarketingApplication',
  operatingSystem: 'Web',
  description: 'AI-powered Instagram post generator. Upload a product image and get on-brand captions and hashtags in seconds.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free plan: 60 AI-generated posts per month',
  },
  url: 'https://www.klinchapp.com/ai-instagram-post-generator',
  publisher: {
    '@type': 'Organization',
    name: 'Klinchapp',
    url: 'https://www.klinchapp.com',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFAFF] via-[#FDF2F8] to-[#FFF8F8]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <SiteHeader variant="marketing" />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F3E8FF] rounded-full text-[#6B2C6B] text-sm font-semibold mb-6">
          Built for Instagram
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          AI Instagram Post Generator<br />
          <span className="text-[#6B2C6B]">Captions in Seconds</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Upload your product. Pick your tone. Get a scroll-stopping Instagram post with caption, emoji, and hashtags — generated by AI, tuned to your brand.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="px-8 py-4 bg-[#6B2C6B] text-white rounded-xl font-bold text-lg hover:bg-[#8B3A8B] transition-all shadow-xl shadow-[#6B2C6B]/30">
            Generate Free Posts →
          </Link>
          <a href="#examples" className="px-8 py-4 bg-white text-[#6B2C6B] rounded-xl font-bold text-lg border-2 border-[#6B2C6B] hover:bg-[#F3E8FF] transition-all">
            See Examples
          </a>
        </div>
        <p className="mt-6 text-gray-500 text-sm">Free plan: 60 posts/month • No credit card required</p>
      </section>

      {/* Why AI for Instagram */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Why use AI for Instagram captions?</h2>
        <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">Instagram rewards consistency, voice, and timing. AI helps you ship all three — without sounding like AI.</p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'On-brand every time', desc: 'Klinchapp learns your tone — playful, luxe, witty, professional — and keeps it consistent across every post.' },
            { title: 'Hashtags that fit', desc: 'Niche-aware hashtag suggestions tailored to your product and audience. Swap, regenerate, or keep — your call.' },
            { title: 'Faster than a content calendar', desc: 'Go from product image to ready-to-post caption in under a minute. No staring at a blinking cursor.' },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-20 bg-white rounded-3xl my-10">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How Klinchapp generates Instagram posts</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Upload your product', desc: 'Drop in a product image or describe what you\'re posting about.' },
            { step: '2', title: 'Pick Instagram & tone', desc: 'Choose Instagram, set your tone of voice, language, and what to highlight.' },
            { step: '3', title: 'Generate & post', desc: 'Get a caption, emoji, and hashtags ready to copy into Instagram. Edit, regenerate, or post.' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 bg-[#6B2C6B] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Examples (sample posts) */}
      <section id="examples" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Real examples, generated by AI</h2>
        <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">Three brands, three tones, all generated by Klinchapp. Same flow, different voices.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {samplePosts.map((post, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* IG-style header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#962fbf] p-[2px]">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-sm font-bold text-[#6B2C6B]">
                    {post.handle.charAt(0).toUpperCase()}
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">@{post.handle}</span>
                <span className="ml-auto text-gray-400 text-xl leading-none">⋯</span>
              </div>
              {/* Image area */}
              <div
                className="aspect-square relative overflow-hidden flex items-center justify-center"
                style={{ backgroundImage: post.image }}
              >
                {/* scattered accents */}
                {post.accentEmojis.map((emoji, idx) => (
                  <span key={idx} className={`absolute ${accentPositions[idx]} drop-shadow-sm`}>
                    {emoji}
                  </span>
                ))}
                {/* soft halo behind focal */}
                <div className="absolute w-2/3 aspect-square rounded-full bg-white/30 blur-3xl" />
                {/* focal emoji */}
                <span className="relative text-[7rem] md:text-[9rem] drop-shadow-lg">
                  {post.imageEmoji}
                </span>
                {/* brand wordmark overlay */}
                <span className="absolute bottom-4 left-0 right-0 text-center text-white font-bold tracking-[0.25em] text-xs uppercase opacity-90 drop-shadow-md">
                  {post.brandLabel}
                </span>
              </div>
              {/* Action row */}
              <div className="flex items-center gap-4 px-4 py-3 text-gray-700">
                <span className="text-xl">♡</span>
                <span className="text-xl">💬</span>
                <span className="text-xl">↗</span>
              </div>
              {/* Caption */}
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-900 mb-2">
                  <span className="font-semibold">@{post.handle}</span> {post.caption}
                </p>
                <p className="text-sm text-[#6B2C6B] font-medium">{post.hashtags}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 text-sm mt-8">Captions generated by Klinchapp. Sample brands shown for illustration.</p>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently asked questions</h2>
        <div className="space-y-4">
          {faqs.map(({ q, a }, i) => (
            <details key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 group">
              <summary className="cursor-pointer list-none flex items-center justify-between p-6 font-semibold text-gray-900">
                <span>{q}</span>
                <span className="text-[#6B2C6B] text-2xl leading-none transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="px-6 pb-6 text-gray-600">{a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-[#6B2C6B] to-[#8B3A8B] rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to generate your first Instagram post?</h2>
          <p className="text-lg opacity-90 mb-8">Free plan, 60 posts a month, no credit card. Get started in under a minute.</p>
          <Link href="/login" className="inline-block px-8 py-4 bg-white text-[#6B2C6B] rounded-xl font-bold text-lg hover:bg-gray-100 transition-all">
            Get Started Free →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
