import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '../components/site-header'
import SiteFooter from '../components/site-footer'

export const metadata: Metadata = {
  title: 'About Klinchapp',
  description: 'Klinchapp is an AI social media post generator that turns product images into platform-ready captions for Instagram, LinkedIn, X, Facebook, and TikTok in 9 voices and 6 languages including RTL Arabic.',
  alternates: {
    canonical: 'https://www.klinchapp.com/about',
  },
  openGraph: {
    title: 'About Klinchapp',
    description: 'AI social media post generator for Instagram, LinkedIn, X, Facebook & TikTok. 9 voices, 6 languages including RTL Arabic.',
    url: 'https://www.klinchapp.com/about',
  },
}

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': 'https://www.klinchapp.com/about#aboutpage',
        url: 'https://www.klinchapp.com/about',
        name: 'About Klinchapp',
        description: 'Klinchapp is an AI social media post generator that turns product images into platform-ready captions for Instagram, LinkedIn, X, Facebook, and TikTok in 9 voices and 6 languages including RTL Arabic.',
        mainEntity: { '@id': 'https://www.klinchapp.com/#organization' },
      },
      {
        '@type': 'Person',
        '@id': 'https://www.klinchapp.com/about#founder',
        name: 'Tipu',
        jobTitle: 'Founder',
        worksFor: { '@id': 'https://www.klinchapp.com/#organization' },
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFAFF] via-[#FDF2F8] to-[#FFF8F8]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <SiteHeader variant="back-home" />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">About Klinchapp</h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            An AI tool that turns product images into platform-ready social media posts — across 5 platforms, 9 voices, and 6 languages.
          </p>
        </div>

        {/* What it is — answer-first */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">What is Klinchapp?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Klinchapp is an AI social media post generator.</strong> You drop in a product image (or a short text description), pick a platform — Instagram, LinkedIn, X, Facebook, or TikTok — choose a tone from nine brand voices, and pick from six languages including right-to-left Arabic. The output is a caption written natively for that platform, voice, and language. No translation, no template, no fill-in-the-blank prompts.
          </p>
          <p className="text-gray-700 leading-relaxed">
            The product is web-based. There's a free plan with 60 AI-generated posts per month and no credit card required.
          </p>
        </section>

        {/* Entity disambiguation — directly addresses the AEO entity-confusion gap */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Klinchapp is not Klinch.app, Clinch, or any other similarly named app</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            For clarity: <strong>Klinchapp</strong> (one word, <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">klinchapp.com</code>) is this AI social media post generator. We have no affiliation with:
          </p>
          <ul className="text-gray-700 leading-relaxed list-disc list-inside space-y-1 ml-2">
            <li><strong>Klinch.app</strong> — a separate AI shopping agent product.</li>
            <li><strong>Clinch</strong> — recruitment software.</li>
            <li>Any other product, brand, or domain with a similar name.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            The brand name is always written as one word: <strong>Klinchapp</strong>. The official domain is <code className="text-sm bg-gray-100 px-1.5 py-0.5 rounded">klinchapp.com</code>.
          </p>
        </section>

        {/* Founder note — first name only, no LinkedIn */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Who built it</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Klinchapp is built by Tipu, the founder. It started from a simple frustration: every AI caption tool produces the same generic, vaguely-marketing-flavored text regardless of platform or audience. Klinchapp was built to do the opposite — generate captions that actually read like they belong on the platform they're for, in the voice the brand actually uses, in the language the audience actually speaks.
          </p>
          <p className="text-gray-700 leading-relaxed">
            The product is solo-founder-built and currently in active development. Feature requests and feedback go to the {' '}
            <Link href="/contact" className="text-[#6B2C6B] font-medium hover:underline">contact form</Link>.
          </p>
        </section>

        {/* Kira methodology cross-link */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">What about the blog?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The <Link href="/blog" className="text-[#6B2C6B] font-medium hover:underline">Klinchapp blog</Link> is written by <strong>Kira</strong>, an autonomous AI content specialist. Kira researches topics, writes posts, fact-checks claims, validates source links, and publishes — without a human editor in the loop. The blog is editorial, not product marketing.
          </p>
          <p className="text-gray-700 leading-relaxed">
            The full methodology — what Kira does at each stage, which models run the pipeline, and how quality gates work — is documented on the {' '}
            <Link href="/blog/author/kira" className="text-[#6B2C6B] font-medium hover:underline">Kira author page</Link>.
          </p>
        </section>

        {/* Contact CTA */}
        <section className="bg-gradient-to-r from-[#6B2C6B] to-[#8B3A8B] rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Questions? Feedback?</h2>
          <p className="text-white/90 mb-6">
            Get in touch — we typically reply within 1–2 business days.
          </p>
          <Link href="/contact" className="inline-block px-6 py-3 bg-white text-[#6B2C6B] rounded-xl font-bold hover:bg-gray-100 transition-colors">
            Contact us
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
