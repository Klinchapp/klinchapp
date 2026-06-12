// Shared template renderer for AI {platform} post-generator landing pages.
// Takes a PlatformConfig, renders the full page. All platform-specific content
// lives in the config — this file is structure only.

import Link from 'next/link'
import type {
  PlatformConfig,
  PlatformSlug,
  SampleCard as SampleCardData,
} from '@/lib/platforms/types'
import SiteHeader from './site-header'
import SiteFooter from './site-footer'
import StartCreatingCTA from './start-creating-cta'

/* ===== Platform icons (mirroring app/home-client.tsx) ===== */
const InstagramIcon = ({ className = 'w-5 h-5 text-[#6B2C6B]' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" ry="5" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" strokeLinecap="round" strokeLinejoin="round" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const LinkedInIcon = ({ className = 'w-5 h-5 text-[#6B2C6B]' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" strokeLinecap="round" strokeLinejoin="round" /><rect x="2" y="9" width="4" height="12" strokeLinecap="round" strokeLinejoin="round" /><circle cx="4" cy="4" r="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const TwitterIcon = ({ className = 'w-5 h-5 text-[#6B2C6B]' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const FacebookIcon = ({ className = 'w-5 h-5 text-[#6B2C6B]' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const TikTokIcon = ({ className = 'w-5 h-5 text-[#6B2C6B]' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

const PLATFORM_ICONS: Record<PlatformSlug, (props: { className?: string }) => JSX.Element> = {
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  twitter: TwitterIcon,
  facebook: FacebookIcon,
  tiktok: TikTokIcon,
}

const PLATFORM_META: Record<PlatformSlug, { name: string; routePath: string }> = {
  instagram: { name: 'Instagram', routePath: 'ai-instagram-post-generator' },
  linkedin: { name: 'LinkedIn', routePath: 'ai-linkedin-post-generator' },
  twitter: { name: 'X', routePath: 'ai-twitter-post-generator' },
  facebook: { name: 'Facebook', routePath: 'ai-facebook-post-generator' },
  tiktok: { name: 'TikTok', routePath: 'ai-tiktok-caption-generator' },
}

/* ===== Action icons inside the IG card ===== */
const HeartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7.5-4.5-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2 4.5-9.5 9-9.5 9z" /></svg>
)
const CommentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.4 8.4 0 0 1-1 4 8.5 8.5 0 0 1-7.6 4.5 8.4 8.4 0 0 1-4-1L3 21l2-5a8.4 8.4 0 0 1-1-4 8.5 8.5 0 0 1 4.5-7.6 8.4 8.4 0 0 1 4-1h.5a8.5 8.5 0 0 1 8 8z" /></svg>
)
const ShareIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round" strokeLinejoin="round" /><polygon points="22 2 15 22 11 13 2 9 22 2" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const BookmarkIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
)

/* ===== Additional action icons for non-IG cards ===== */
const RepostIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" /></svg>
)
const ReplyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.4 8.4 0 0 1-1 4 8.5 8.5 0 0 1-7.6 4.5 8.4 8.4 0 0 1-4-1L3 21l2-5a8.4 8.4 0 0 1-1-4 8.5 8.5 0 0 1 4.5-7.6 8.4 8.4 0 0 1 4-1h.5a8.5 8.5 0 0 1 8 8z" /></svg>
)
const ThumbsUpIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2 9h4v12H2zM22 11a2 2 0 0 0-2-2h-6.3l1-4.6V4a1.5 1.5 0 0 0-3 0L8 9v12h11a2 2 0 0 0 2-1.8l1-7z" /></svg>
)

/* ===== Shared card footer (used by all 5 native variants) ===== */
function CardFooter({ tone, platformName, charCount, charLimit, tagCount }: {
  tone: string; platformName: string; charCount: number; charLimit: number; tagCount: number
}) {
  return (
    <div className="mt-auto px-4 py-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-mono">
      <span className="font-semibold text-[#6B2C6B] uppercase tracking-wider text-[10px]">{tone}</span>
      <span>{platformName} · {charCount}/{charLimit.toLocaleString()} · {tagCount} tags</span>
    </div>
  )
}

/* ===== Per-platform native card variants ===== */
type CardProps = { data: SampleCardData; platformName: string }

function InstagramCard({ data, platformName }: CardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6B2C6B] to-[#8B3A8B] flex items-center justify-center text-white text-xs font-bold">K</div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-gray-900">your_brand</span>
            <span className="text-[11px] text-gray-500">Sponsored</span>
          </div>
        </div>
        <span className="v2-ai-sample-badge">AI Sample</span>
      </div>
      <div className="relative bg-white flex items-center justify-center aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.image} alt={data.imageAlt} className="w-2/3 h-auto" />
      </div>
      <div className="flex items-center justify-between px-4 py-2 text-gray-800">
        <div className="flex items-center gap-3"><HeartIcon /><CommentIcon /><ShareIcon /></div>
        <BookmarkIcon />
      </div>
      <div className="px-4 pb-3 text-sm text-gray-900">
        <p className="leading-snug"><span className="font-semibold">your_brand</span> {data.caption}</p>
        <p className="mt-2 leading-snug text-[#6B2C6B]">{data.hashtags.join(' ')}</p>
      </div>
      <CardFooter tone={data.toneLabel} platformName={platformName} charCount={data.charCount} charLimit={data.charLimit} tagCount={data.hashtags.length} />
    </div>
  )
}

function LinkedInCard({ data, platformName }: CardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col">
      <div className="flex items-start justify-between px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded bg-gradient-to-br from-[#6B2C6B] to-[#8B3A8B] flex items-center justify-center text-white text-base font-bold flex-shrink-0">K</div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-gray-900">Your Brand</span>
            <span className="text-[12px] text-gray-600">Brand · Sponsored</span>
            <span className="text-[12px] text-gray-500">2d</span>
          </div>
        </div>
        <span className="v2-ai-sample-badge">AI Sample</span>
      </div>
      <div className="px-4 pb-3 text-sm text-gray-900">
        <p className="leading-relaxed whitespace-pre-line">{data.caption}</p>
        {data.hashtags.length > 0 && (
          <p className="mt-2 leading-snug text-[#6B2C6B]">{data.hashtags.join(' ')}</p>
        )}
      </div>
      <div className="relative bg-white flex items-center justify-center aspect-[1.91/1]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.image} alt={data.imageAlt} className="w-1/3 h-auto" />
      </div>
      <div className="flex items-center gap-2 px-4 py-2 text-[12px] text-gray-600">
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#0a66c2] text-white"><ThumbsUpIcon /></span>
        <span>247 reactions · 38 comments</span>
      </div>
      <div className="grid grid-cols-4 border-t border-gray-100 text-[12px] text-gray-700 font-semibold">
        <button className="py-2 hover:bg-gray-50 flex items-center justify-center gap-1"><ThumbsUpIcon /> Like</button>
        <button className="py-2 hover:bg-gray-50">Comment</button>
        <button className="py-2 hover:bg-gray-50">Repost</button>
        <button className="py-2 hover:bg-gray-50">Send</button>
      </div>
      <CardFooter tone={data.toneLabel} platformName={platformName} charCount={data.charCount} charLimit={data.charLimit} tagCount={data.hashtags.length} />
    </div>
  )
}

function TwitterCard({ data, platformName }: CardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col">
      <div className="flex items-start justify-between px-4 pt-3 pb-2">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B2C6B] to-[#8B3A8B] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">K</div>
          <div className="flex items-center gap-1 text-sm leading-tight pt-1 flex-wrap">
            <span className="font-semibold text-gray-900">Your Brand</span>
            <span className="text-gray-500">@yourbrand · 2h</span>
          </div>
        </div>
        <span className="v2-ai-sample-badge">AI Sample</span>
      </div>
      <div className="px-4 pb-3 text-sm text-gray-900">
        <p className="leading-snug">{data.caption}{data.hashtags.length > 0 && <> <span className="text-[#6B2C6B]">{data.hashtags.join(' ')}</span></>}</p>
      </div>
      <div className="mx-4 mb-3 overflow-hidden">
        <div className="bg-white flex items-center justify-center aspect-[1.91/1]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.image} alt={data.imageAlt} className="w-1/4 h-auto" />
        </div>
      </div>
      <div className="flex items-center justify-between px-4 pb-3 text-[12px] text-gray-500">
        <span className="flex items-center gap-1"><ReplyIcon /> 12</span>
        <span className="flex items-center gap-1"><RepostIcon /> 28</span>
        <span className="flex items-center gap-1"><HeartIcon /> 184</span>
        <span>4.2K views</span>
      </div>
      <CardFooter tone={data.toneLabel} platformName={platformName} charCount={data.charCount} charLimit={data.charLimit} tagCount={data.hashtags.length} />
    </div>
  )
}

function FacebookCard({ data, platformName }: CardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col">
      <div className="flex items-start justify-between px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B2C6B] to-[#8B3A8B] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">K</div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-gray-900">Your Brand</span>
            <span className="text-[12px] text-gray-500">Sponsored</span>
          </div>
        </div>
        <span className="v2-ai-sample-badge">AI Sample</span>
      </div>
      <div className="px-4 pb-3 text-sm text-gray-900">
        <p className="leading-relaxed whitespace-pre-line">{data.caption}</p>
        {data.hashtags.length > 0 && (
          <p className="mt-2 leading-snug text-[#6B2C6B]">{data.hashtags.join(' ')}</p>
        )}
      </div>
      <div className="relative bg-white flex items-center justify-center aspect-[1.91/1]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.image} alt={data.imageAlt} className="w-1/3 h-auto" />
      </div>
      <div className="flex items-center justify-between px-4 py-2 text-[12px] text-gray-600">
        <span>184 reactions</span>
        <span>23 comments · 8 shares</span>
      </div>
      <div className="grid grid-cols-3 border-t border-gray-100 text-[13px] text-gray-700 font-semibold">
        <button className="py-2 hover:bg-gray-50 flex items-center justify-center gap-1"><ThumbsUpIcon /> Like</button>
        <button className="py-2 hover:bg-gray-50">Comment</button>
        <button className="py-2 hover:bg-gray-50">Share</button>
      </div>
      <CardFooter tone={data.toneLabel} platformName={platformName} charCount={data.charCount} charLimit={data.charLimit} tagCount={data.hashtags.length} />
    </div>
  )
}

function TikTokCard({ data, platformName }: CardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col">
      <div className="relative bg-white flex items-center justify-center aspect-[9/16]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.image} alt={data.imageAlt} className="w-3/4 h-auto" />
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/80 backdrop-blur text-[11px] font-semibold text-gray-900">For You</div>
        <div className="absolute top-3 right-3"><span className="v2-ai-sample-badge">AI Sample</span></div>
        <div className="absolute right-2 bottom-3 flex flex-col items-center gap-3 text-[#6B2C6B]">
          <div className="flex flex-col items-center"><HeartIcon /><span className="text-[10px] font-semibold">12.4K</span></div>
          <div className="flex flex-col items-center"><CommentIcon /><span className="text-[10px] font-semibold">428</span></div>
          <div className="flex flex-col items-center"><ShareIcon /><span className="text-[10px] font-semibold">Share</span></div>
        </div>
      </div>
      <div className="px-4 py-3 text-sm text-gray-900">
        <p className="font-semibold mb-1">@yourbrand</p>
        <p className="leading-snug">{data.caption}</p>
        <p className="mt-2 leading-snug text-[#6B2C6B]">{data.hashtags.join(' ')}</p>
      </div>
      <CardFooter tone={data.toneLabel} platformName={platformName} charCount={data.charCount} charLimit={data.charLimit} tagCount={data.hashtags.length} />
    </div>
  )
}

/* ===== Card router — picks the right native shell for the platform ===== */
function SampleCard({ data, slug, platformName }: { data: SampleCardData; slug: PlatformSlug; platformName: string }) {
  switch (slug) {
    case 'instagram': return <InstagramCard data={data} platformName={platformName} />
    case 'linkedin': return <LinkedInCard data={data} platformName={platformName} />
    case 'twitter': return <TwitterCard data={data} platformName={platformName} />
    case 'facebook': return <FacebookCard data={data} platformName={platformName} />
    case 'tiktok': return <TikTokCard data={data} platformName={platformName} />
  }
}

/* ===== Main template ===== */
export function PlatformPage({ config }: { config: PlatformConfig }) {
  const Icon = PLATFORM_ICONS[config.slug]
  const otherPlatforms = (Object.keys(PLATFORM_META) as PlatformSlug[]).filter((s) => s !== config.slug)

  // FAQ schema.org markup
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Klinchapp', item: 'https://www.klinchapp.com/' },
      { '@type': 'ListItem', position: 2, name: `AI ${config.name} Post Generator`, item: `https://www.klinchapp.com/${config.routePath}` },
    ],
  }

  const softwareAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `Klinchapp — AI ${config.name} Post Generator`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: config.metaDescription,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Free plan: 60 AI-generated posts per month' },
    featureList: [
      `AI ${config.name} post generation`,
      '9 distinct brand voices',
      '6 languages including right-to-left Arabic',
      'Image-to-caption generation',
      'Localized hashtags',
      'Free plan with 60 posts per month',
    ],
    url: `https://www.klinchapp.com/${config.routePath}`,
    publisher: { '@type': 'Organization', name: 'Klinchapp', url: 'https://www.klinchapp.com' },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFAFF] via-[#FDF2F8] to-[#FFF8F8] text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }} />

      <SiteHeader variant="marketing" />

      <main>
      {/* ===== HERO ===== */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3E8FF] text-[#6B2C6B] text-xs font-semibold uppercase tracking-wider mb-5">
          <Icon className="w-4 h-4 text-[#6B2C6B]" />
          {config.name}
        </div>
        <h1 className="font-extrabold leading-[1.05] mb-6 max-w-5xl mx-auto">
          <span className="block text-xl md:text-2xl lg:text-3xl text-gray-900 mb-3">
            {config.hero.h1Top}
          </span>
          <span className="block text-3xl md:text-5xl lg:text-6xl text-[#6B2C6B] tracking-tight">
            {config.hero.h1Bottom}
          </span>
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">{config.hero.sub}</p>
        <StartCreatingCTA
          className="inline-block px-8 py-4 bg-[#6B2C6B] text-white rounded-xl font-bold text-lg hover:bg-[#8B3A8B] transition-all shadow-xl shadow-[#6B2C6B]/30"
        />
        <p className="text-xs text-gray-500 mt-4">Free plan · 60 posts/month · No credit card required</p>
      </section>

      {/* ===== 3-CARD SAMPLE SHOWCASE ===== */}
      <section id="samples" className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            Three AI {config.name} posts. Three voices.
          </h2>
          <div className="text-gray-700 space-y-1">
            <p>One template. Different categories.</p>
            <p>Different tones. All AI-generated.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {config.samples.map((s, i) => (
            <SampleCard key={i} data={s} slug={config.slug} platformName={config.name} />
          ))}
        </div>
      </section>

      {/* ===== BEST PRACTICES ===== */}
      <section id="how" className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            What makes a good {config.name} post — and how Klinchapp writes it.
          </h2>
          <div className="text-gray-700 space-y-1">
            <p>Three things {config.name} actually rewards.</p>
            <p>Klinchapp&apos;s prompts are tuned for each one.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {config.bestPractices.map((bp, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-[#F3E8FF] text-[#6B2C6B] flex items-center justify-center font-bold text-sm mb-4">
                {i + 1}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{bp.title}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{bp.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SIX LANGUAGES STRIP ===== */}
      <section id="languages" className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            AI-generated, in six languages.
          </h2>
          <div className="text-gray-700 space-y-1">
            <p>Same product. Same voice.</p>
            <p>Localized hashtags and emojis — not just translated text.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="text-xs font-mono text-[#6B2C6B] mb-2">EN · English</div>
            <p className="text-sm text-gray-900 leading-snug">{config.languageSamples.en}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="text-xs font-mono text-[#6B2C6B] mb-2">ES · Español</div>
            <p className="text-sm text-gray-900 leading-snug">{config.languageSamples.es}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100" dir="rtl">
            <div className="text-xs font-mono text-[#6B2C6B] mb-2" dir="ltr">AR · العربية</div>
            <p className="text-sm text-gray-900 leading-snug">{config.languageSamples.ar}</p>
          </div>
        </div>
        <p className="text-center text-sm text-gray-600 mt-6">
          Plus Portuguese, French, and Hindi.
        </p>
      </section>

      {/* ===== ALSO WRITES FOR ===== */}
      <section id="also" className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            Also generates AI posts for every other platform.
          </h2>
          <p className="text-gray-700">Same product image. Different platform. Klinchapp re-tunes the post.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {otherPlatforms.map((slug) => {
            const PIcon = PLATFORM_ICONS[slug]
            const meta = PLATFORM_META[slug]
            return (
              <Link
                key={slug}
                href={`/${meta.routePath}`}
                className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#6B2C6B] hover:shadow-md transition-all flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] flex items-center justify-center mb-3 group-hover:bg-[#6B2C6B] transition-colors">
                  <PIcon className="w-6 h-6 text-[#6B2C6B] group-hover:text-white transition-colors" />
                </div>
                <span className="font-bold text-gray-900 group-hover:text-[#6B2C6B]">{meta.name}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ===== AUDIENCE STRIP (compact) ===== */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Who uses an AI {config.name} post generator.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-bold text-[#6B2C6B] mb-1">E-commerce sellers</h3>
            <p className="text-sm text-gray-700">Generate captions for new products without rewriting the same description five ways.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-bold text-[#6B2C6B] mb-1">Solo creators</h3>
            <p className="text-sm text-gray-700">Keep posting consistently when there isn&apos;t a copywriter on payroll.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-bold text-[#6B2C6B] mb-1">Global marketers</h3>
            <p className="text-sm text-gray-700">Ship the same campaign in six languages without six freelancers.</p>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Frequently asked.</h2>
        </div>
        <div className="space-y-4">
          {config.faqs.map((f, i) => (
            <details key={i} className="bg-white rounded-2xl p-5 border border-gray-100 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                <span>{f.q}</span>
                <span className="text-[#6B2C6B] text-xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm text-gray-700 mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-[#6B2C6B] via-[#8B3A8B] to-[#6B2C6B] rounded-3xl p-12 md:p-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Ready to Transform Your {config.name} Posts?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Drop a product image. Pick a voice. Klinchapp does the rest.
          </p>
          <StartCreatingCTA
            className="inline-block px-8 py-4 bg-white text-[#6B2C6B] rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl"
          />
          <p className="text-xs opacity-80 mt-4">Free plan · 60 posts/month · No credit card required.</p>
        </div>
      </section>

      </main>

      <SiteFooter />
    </div>
  )
}
