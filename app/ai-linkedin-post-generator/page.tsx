import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '../components/site-header'
import SiteFooter from '../components/site-footer'

export const metadata: Metadata = {
  title: 'AI LinkedIn Post Generator | Hooks That Stop the Scroll',
  description: 'Generate scroll-stopping LinkedIn posts with AI. Hooks, structure, and tone tuned for LinkedIn — captions in seconds. Free plan, no credit card.',
  alternates: {
    canonical: 'https://www.klinchapp.com/ai-linkedin-post-generator',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.klinchapp.com/ai-linkedin-post-generator',
    siteName: 'Klinchapp',
    title: 'AI LinkedIn Post Generator — Klinchapp',
    description: 'Generate scroll-stopping LinkedIn posts with AI. Hooks, structure, and tone — in seconds.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Klinchapp AI LinkedIn Post Generator' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI LinkedIn Post Generator — Klinchapp',
    description: 'Generate scroll-stopping LinkedIn posts with AI. Hooks, structure, and tone — in seconds.',
    images: ['/og-image.png'],
  },
}

const faqs = [
  {
    q: 'What is an AI LinkedIn post generator?',
    a: 'It\'s a tool that uses AI to write LinkedIn posts — hook, body, CTA — tailored to how the LinkedIn feed actually rewards content. Klinchapp learns your voice and angle, then drafts a post you can ship: opening hook, line-broken body, and a closing line that prompts engagement.',
  },
  {
    q: 'Is Klinchapp free to use?',
    a: 'Yes. The free plan includes 60 AI-generated posts per month across LinkedIn, Instagram, X, Facebook, and TikTok. No credit card required to start.',
  },
  {
    q: 'Will my LinkedIn posts sound like AI?',
    a: 'No — that\'s the point. Klinchapp learns your tone (founder, operator, advisor, expert) and angle, so posts read like a thoughtful colleague wrote them. You stay in control: edit, regenerate, or fine-tune the hook before publishing.',
  },
  {
    q: 'How long should a LinkedIn post be?',
    a: 'LinkedIn rewards posts that earn the click on "see more" — usually 150–300 words with a strong hook in the first 1–2 lines. Klinchapp drafts to that shape by default and lets you adjust length and structure.',
  },
  {
    q: 'Does Klinchapp suggest hashtags for LinkedIn?',
    a: 'Yes — sparingly. LinkedIn favours 3–5 relevant hashtags, not Instagram-style stacks. Klinchapp suggests hashtags tuned to your topic and audience; keep them, swap them, or skip.',
  },
  {
    q: 'Can I match my professional tone of voice?',
    a: 'Yes. Choose from founder, operator, advisor, witty, or thought-leader — or define your own brand voice. Klinchapp keeps the tone consistent across every LinkedIn post you generate.',
  },
]

const samplePosts = [
  {
    name: 'Sarah Chen',
    title: 'Founder & CEO, Northbeam Analytics',
    avatarBg: 'from-[#6B2C6B] to-[#8B3A8B]',
    timeAgo: '2d',
    body: [
      'We just hit $1M ARR.',
      'Eighteen months ago I was wiring code at 2am and convinced this would never work.',
      'The thing nobody tells you about early-stage SaaS:',
      'It\'s not the product that almost kills you. It\'s the silence between launches.',
      'What got us through:',
      '→ Talking to one customer every single day',
      '→ Shipping something — anything — every week',
      '→ Cutting features faster than we added them',
      'Onward to $10M. Same playbook.',
    ],
    likes: 1247,
    comments: 184,
    reposts: 36,
  },
  {
    name: 'Marcus Reid',
    title: 'VP Marketing, Halcyon Labs',
    avatarBg: 'from-[#0077b5] to-[#005983]',
    timeAgo: '4h',
    body: [
      'Stop A/B testing your landing page headline.',
      'You\'re not at scale. You don\'t have the traffic. The "winner" is statistical noise.',
      'Here\'s what to do instead at 0–10K MRR:',
      '1/ Talk to 5 customers a week',
      '2/ Write down the exact phrases they use',
      '3/ Put those phrases on your landing page',
      'You don\'t need experiments. You need conversations.',
      'The data comes later.',
    ],
    likes: 892,
    comments: 127,
    reposts: 58,
  },
  {
    name: 'Priya Anand',
    title: 'Career Coach · Ex-Google PM',
    avatarBg: 'from-[#962fbf] via-[#d62976] to-[#feda75]',
    timeAgo: '1d',
    body: [
      'A recruiter once told me:',
      '"We don\'t hire for the role. We hire for the next role."',
      'It changed how I write resumes.',
      'Stop listing what you did. Start showing what you\'re ready for.',
      'Three lines I want every PM resume to have:',
      '→ A decision you owned that someone above you disagreed with',
      '→ A metric you moved by 2x or more',
      '→ A team you grew (people, scope, or budget)',
      'Hiring managers aren\'t reading your resume. They\'re scanning for signals.',
      'Make them obvious.',
    ],
    likes: 2103,
    comments: 296,
    reposts: 412,
  },
]

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Klinchapp — AI LinkedIn Post Generator',
  applicationCategory: 'SocialMediaMarketingApplication',
  operatingSystem: 'Web',
  description: 'AI-powered LinkedIn post generator. Hooks, structure, and tone tuned for LinkedIn — captions in seconds.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free plan: 60 AI-generated posts per month',
  },
  url: 'https://www.klinchapp.com/ai-linkedin-post-generator',
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
          Built for LinkedIn
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          AI LinkedIn Post Generator<br />
          <span className="text-[#6B2C6B]">Hooks That Stop the Scroll</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Tell Klinchapp your angle. Pick your tone. Get a LinkedIn post with a strong hook, line-broken body, and a closing line that earns engagement — generated by AI, in your voice.
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

      {/* Why AI for LinkedIn */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Why use AI for LinkedIn posts?</h2>
        <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">LinkedIn rewards strong hooks, scannable structure, and a clear point of view. AI helps you ship all three without staring at a blinking cursor.</p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Hooks that earn the click', desc: 'The first 1–2 lines decide whether anyone clicks "see more". Klinchapp drafts openers tuned to stop the scroll.' },
            { title: 'Built-in LinkedIn structure', desc: 'Short lines, bullet steps, and a closing CTA — the format the LinkedIn feed actually rewards, by default.' },
            { title: 'Your voice, not generic AI', desc: 'Pick founder, operator, advisor, or thought-leader — Klinchapp keeps the tone consistent post after post.' },
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
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How Klinchapp generates LinkedIn posts</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Share your angle', desc: 'Drop in the insight, story, or product update you want to post about.' },
            { step: '2', title: 'Pick LinkedIn & tone', desc: 'Choose LinkedIn, set your voice (founder, operator, advisor, witty), and what to highlight.' },
            { step: '3', title: 'Generate & publish', desc: 'Get a hook, line-broken body, and CTA ready to paste into LinkedIn. Edit, regenerate, or post.' },
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

      {/* Examples (sample LinkedIn posts) */}
      <section id="examples" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Real examples, generated by AI</h2>
        <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">Three voices, three angles, all generated by Klinchapp. Same flow, different tones.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {samplePosts.map((post, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              {/* LinkedIn-style header */}
              <div className="flex items-start gap-3 px-4 py-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${post.avatarBg} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                  {post.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{post.name}</p>
                  <p className="text-xs text-gray-500 truncate">{post.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{post.timeAgo} · 🌐</p>
                </div>
              </div>
              {/* Body */}
              <div className="px-4 pb-3 flex-1">
                <div className="text-sm text-gray-900 space-y-2 leading-relaxed">
                  {post.body.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              </div>
              {/* Engagement count */}
              <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
                <span>👍 ❤️ 💡 {post.likes.toLocaleString()}</span>
                <span>{post.comments} comments · {post.reposts} reposts</span>
              </div>
              {/* Action row */}
              <div className="grid grid-cols-4 gap-1 px-2 py-2 border-t border-gray-100 text-xs font-semibold text-gray-600">
                <button className="py-1.5 hover:bg-gray-50 rounded">👍 Like</button>
                <button className="py-1.5 hover:bg-gray-50 rounded">💬 Comment</button>
                <button className="py-1.5 hover:bg-gray-50 rounded">🔄 Repost</button>
                <button className="py-1.5 hover:bg-gray-50 rounded">📤 Send</button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 text-sm mt-8">Posts generated by Klinchapp. Sample profiles shown for illustration.</p>
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
          <h2 className="text-3xl font-bold mb-4">Ready to generate your first LinkedIn post?</h2>
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
