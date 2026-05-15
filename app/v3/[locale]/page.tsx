// v3 staging homepage — Option 2 tightening of v2 (single-line H2s, single-paragraph subtitles)
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LOCALE_CODES, isLocale, getDirection, type Locale } from '../../v2/_configs/locales'

export async function generateStaticParams() {
  return LOCALE_CODES.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string }
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {}
  return {
    title: 'Klinchapp V3 — Homepage (staging)',
    description:
      'AI social media post generator. Drop a product image. Get captions tuned to 5 platforms, 9 voices, 6 languages — in seconds.',
    robots: { index: false, follow: false },
    alternates: {
      languages: LOCALE_CODES.reduce(
        (acc, l) => ({ ...acc, [l]: `/v3/${l}` }),
        {} as Record<string, string>
      ),
    },
  }
}

/* ===== Platform icons (mirroring app/home-client.tsx so visual identity stays consistent) ===== */
const InstagramIcon = ({ className = 'w-5 h-5 text-[#6B2C6B]' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" ry="5" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" strokeLinecap="round" strokeLinejoin="round" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const LinkedInIcon = ({ className = 'w-5 h-5 text-[#6B2C6B]' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" strokeLinecap="round" strokeLinejoin="round" /><rect x="2" y="9" width="4" height="12" strokeLinecap="round" strokeLinejoin="round" /><circle cx="4" cy="4" r="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const XIcon = ({ className = 'w-5 h-5 text-[#6B2C6B]' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const FacebookIcon = ({ className = 'w-5 h-5 text-[#6B2C6B]' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const TikTokIcon = ({ className = 'w-5 h-5 text-[#6B2C6B]' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

/** Product image card — white backdrop with the shoe centered. Accepts overlay children. */
function ProductCard({
  children,
  className = '',
  imgClassName = 'w-3/4 h-auto',
}: {
  children?: React.ReactNode
  className?: string
  imgClassName?: string
}) {
  return (
    <div className={`relative bg-white flex items-center justify-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/v2-mockup/shoe.png" alt="AI-generated social media post sample featuring a white slip-on sneaker, in Klinchapp's brand purple line-art style" className={imgClassName} />
      {children}
    </div>
  )
}

export default function V2HomePage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound()

  const locale = params.locale as Locale
  const dir = getDirection(locale)

  const softwareAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Klinchapp',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'AI social media post generator for Instagram, LinkedIn, X, Facebook & TikTok. 9 voices, 6 languages including RTL Arabic.',
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
    featureList: [
      'AI captions for 5 platforms (Instagram, LinkedIn, X, Facebook, TikTok)',
      '9 distinct brand voices',
      '6 languages including right-to-left Arabic',
      'Image-to-caption generation',
      'Localized hashtags',
      'Free plan with 60 posts per month',
    ],
    url: `https://www.klinchapp.com/v3/${locale}`,
  }

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-br from-[#FDFAFF] via-[#FDF2F8] to-[#FFF8F8] text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }} />

      {/* Header */}
      <header className="pt-6 px-6 max-w-7xl mx-auto">
        <nav className="flex items-center justify-between py-4">
          <Link href={`/v3/${locale}`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6B2C6B] flex items-center justify-center text-white font-bold">K</div>
            <span className="font-extrabold text-xl">Klinchapp</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-700">
            <a href="#how" className="hover:text-[#6B2C6B]">How it works</a>
            <a href="#audiences" className="hover:text-[#6B2C6B]">Who it&apos;s for</a>
            <a href="#tones" className="hover:text-[#6B2C6B]">Voices</a>
            <a href="#platforms" className="hover:text-[#6B2C6B]">Platforms</a>
            <a href="#faq" className="hover:text-[#6B2C6B]">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-[#6B2C6B]">Log in</Link>
            <Link href="/login" className="text-sm font-bold px-4 py-2 bg-[#6B2C6B] text-white rounded-lg hover:bg-[#8B3A8B]">Start free</Link>
          </div>
        </nav>
      </header>

      <main>
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#6B2C6B] mb-4">
          Built for visual brands posting across platforms
        </p>
        <h1 className="font-extrabold leading-[1.05] mb-6 max-w-5xl mx-auto">
          <span className="block text-xl md:text-2xl lg:text-3xl text-gray-900 mb-3">
            AI Social Media Post Generator.
          </span>
          <span className="block text-4xl md:text-5xl lg:text-6xl text-[#6B2C6B] tracking-tight lg:whitespace-nowrap">
            5 Platforms. 9 Voices. 6 Languages.
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Drop a product image — or describe it in text. Klinchapp generates captions tuned to where you&apos;re posting, who you&apos;re talking to, and how you want to sound — in seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-3">
          <Link href="/login" className="px-8 py-4 bg-[#6B2C6B] text-white rounded-xl font-bold text-lg hover:bg-[#8B3A8B] transition-all shadow-xl shadow-[#6B2C6B]/30">
            Start Creating Free →
          </Link>
          <a href="#how" className="px-8 py-4 bg-white text-[#6B2C6B] rounded-xl font-bold text-lg border-2 border-[#6B2C6B] hover:bg-[#F3E8FF] transition-all">
            See how it works
          </a>
        </div>
        <p className="text-sm text-gray-500">Free plan · 60 posts/month · 5 platforms · 6 languages · 9 voices · No credit card</p>
      </section>

      {/* HOW IT WORKS — 4-step capability tour + reveal */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F3E8FF] rounded-full text-[#6B2C6B] text-sm font-semibold mb-6">How it works</div>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            From product photo to platform-ready posts <span className="text-[#6B2C6B]">in four steps.</span>
          </h2>
          <p className="text-lg text-gray-600">
            Each step exists because Klinchapp does something most AI post generators don&apos;t.
          </p>
        </div>

        {/* STEP 1: Upload */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center mb-20">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-12 h-12 rounded-full bg-[#6B2C6B] text-white flex items-center justify-center font-extrabold text-xl">1</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B2C6B]">Upload</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">Show us what you sell.</h3>
            <p className="text-lg text-gray-600 leading-relaxed mb-3">
              Drag in a product image. Klinchapp&apos;s AI vision sees what&apos;s distinctive — colors, shape, brand cues, mood — without you typing a word.
            </p>
            <p className="text-sm text-gray-500 italic">No image yet? Type a description instead — Klinchapp handles both flows.</p>
          </div>
          <div>
            <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-[#6B2C6B]/30 p-5">
              <div className="grid grid-cols-2 gap-4 items-start">
                <div>
                  <ProductCard className="aspect-square rounded-xl overflow-hidden border border-gray-100" />
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500 font-mono">
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    your-product.jpg
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B2C6B] mb-3 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /></svg>
                    What Klinchapp sees
                  </div>
                  <ul className="space-y-2 text-xs">
                    <li className="flex justify-between border-b border-gray-100 pb-1.5"><span className="text-gray-500">Category</span><span className="font-semibold">Sneaker</span></li>
                    <li className="flex justify-between border-b border-gray-100 pb-1.5"><span className="text-gray-500">Style</span><span className="font-semibold">Slip-on, knit upper</span></li>
                    <li className="flex justify-between border-b border-gray-100 pb-1.5"><span className="text-gray-500">Color</span><span className="font-semibold">White</span></li>
                    <li className="flex justify-between"><span className="text-gray-500">Mood</span><span className="font-semibold">Minimal · lifestyle</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2: Platform */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center mb-20">
          <div className="md:order-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-12 h-12 rounded-full bg-[#6B2C6B] text-white flex items-center justify-center font-extrabold text-xl">2</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B2C6B]">Platform</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">Pick a platform. Or all five.</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Each platform gets its own caption — character limits, hashtag conventions, and structural quirks tuned to how Instagram, LinkedIn, X, Facebook, and TikTok actually reward content.
            </p>
          </div>
          <div className="md:order-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">Choose platforms</div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-[#6B2C6B] bg-[#F3E8FF]">
                  <div className="w-9 h-9 bg-[#F3E8FF] rounded-md flex items-center justify-center shrink-0 border border-[#6B2C6B]/20"><InstagramIcon /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold">Instagram</div>
                    <div className="text-[10px] text-gray-500">2,200 chars · 5–10 hashtags</div>
                  </div>
                  <span className="text-[#6B2C6B] font-bold text-lg">✓</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                  <div className="w-9 h-9 bg-[#F3E8FF] rounded-md flex items-center justify-center shrink-0"><LinkedInIcon /></div>
                  <div className="flex-1 min-w-0"><div className="text-sm font-bold">LinkedIn</div><div className="text-[10px] text-gray-500">3,000 chars · 2–3 hashtags</div></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                  <div className="w-9 h-9 bg-[#F3E8FF] rounded-md flex items-center justify-center shrink-0"><XIcon /></div>
                  <div className="flex-1 min-w-0"><div className="text-sm font-bold">X</div><div className="text-[10px] text-gray-500">280 chars · 1–2 hashtags</div></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                  <div className="w-9 h-9 bg-[#F3E8FF] rounded-md flex items-center justify-center shrink-0"><FacebookIcon /></div>
                  <div className="flex-1 min-w-0"><div className="text-sm font-bold">Facebook</div><div className="text-[10px] text-gray-500">63,206 chars · 0–2 hashtags</div></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                  <div className="w-9 h-9 bg-[#F3E8FF] rounded-md flex items-center justify-center shrink-0"><TikTokIcon /></div>
                  <div className="flex-1 min-w-0"><div className="text-sm font-bold">TikTok</div><div className="text-[10px] text-gray-500">2,200 chars · 3–5 hashtags</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: Tone */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center mb-20">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-12 h-12 rounded-full bg-[#6B2C6B] text-white flex items-center justify-center font-extrabold text-xl">3</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B2C6B]">Tone</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">Choose your voice.</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Nine tones — same product, very different captions. Pick Professional for the brand channel, Founder for LinkedIn, Witty for the X account.
            </p>
          </div>
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">Choose voice</div>
              <div className="grid grid-cols-3 gap-2">
                <button className="px-3 py-2 rounded-lg text-xs font-semibold border-2 border-[#6B2C6B] bg-[#F3E8FF] text-[#6B2C6B]">Professional</button>
                <button className="px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600">Casual</button>
                <button className="px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600">Enthusiastic</button>
                <button className="px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600">Humorous</button>
                <button className="px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600">Inspirational</button>
                <button className="px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600">Luxe</button>
                <button className="px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600">Witty</button>
                <button className="px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600">Founder</button>
                <button className="px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600">Bold</button>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-700 leading-relaxed">
                &ldquo;Introducing our first slip-on. White knit upper, breathable, single-piece construction. Available now.&rdquo;
              </div>
              <div className="mt-2 text-[10px] text-gray-400 font-mono">↑ Professional voice · AI sample</div>
            </div>
          </div>
        </div>

        {/* STEP 4: Language */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center mb-20">
          <div className="md:order-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-12 h-12 rounded-full bg-[#6B2C6B] text-white flex items-center justify-center font-extrabold text-xl">4</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B2C6B]">Language</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">Write in your audience&apos;s language.</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Six languages — English, Spanish, Portuguese, French, Arabic (right-to-left), Hindi. Hashtags localize too. Posts generated directly in the target language, not translated from English.
            </p>
          </div>
          <div className="md:order-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">Choose language</div>
              <div className="grid grid-cols-3 gap-2">
                <button className="px-2 py-3 rounded-lg border border-gray-200 text-gray-600">
                  <div className="font-extrabold text-base">EN</div><div className="text-[9px] mt-0.5 font-medium">English</div>
                </button>
                <button className="px-2 py-3 rounded-lg border border-gray-200 text-gray-600">
                  <div className="font-extrabold text-base">ES</div><div className="text-[9px] mt-0.5 font-medium">Español</div>
                </button>
                <button className="px-2 py-3 rounded-lg border border-gray-200 text-gray-600">
                  <div className="font-extrabold text-base">PT</div><div className="text-[9px] mt-0.5 font-medium">Português</div>
                </button>
                <button className="px-2 py-3 rounded-lg border border-gray-200 text-gray-600">
                  <div className="font-extrabold text-base">FR</div><div className="text-[9px] mt-0.5 font-medium">Français</div>
                </button>
                <button className="px-2 py-3 rounded-lg border-2 border-[#6B2C6B] bg-[#F3E8FF] text-[#6B2C6B] relative">
                  <div className="font-extrabold text-base">AR</div><div className="text-[9px] mt-0.5 font-medium">العربية</div>
                  <span className="absolute -top-1.5 -right-1.5 text-[8px] bg-[#6B2C6B] text-white px-1.5 py-0.5 rounded-full font-bold">RTL</span>
                </button>
                <button className="px-2 py-3 rounded-lg border border-gray-200 text-gray-600">
                  <div className="font-extrabold text-base">HI</div><div className="text-[9px] mt-0.5 font-medium">हिन्दी</div>
                </button>
              </div>
              <div dir="rtl" className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-700 leading-relaxed">
                نقدّم أول حذاء سهل الارتداء لدينا. طبقة علوية محاكة باللون الأبيض، قابلة للتنفس، تصميم من قطعة واحدة. متوفر الآن.
              </div>
              <div className="mt-2 text-[10px] text-gray-400 font-mono">↑ Arabic, right-to-left · AI sample</div>
            </div>
          </div>
        </div>

        {/* STEP 5 / REVEAL */}
        <div className="text-center max-w-3xl mx-auto mb-10 mt-24">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6B2C6B] to-[#8B3A8B] text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-[#6B2C6B]/30">5</span>
          </div>
          <h3 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">Hit generate. Done.</h3>
          <p className="text-lg text-gray-600 mb-3">
            One image. Five platforms. Nine voices. Six languages.
          </p>
          <p className="text-2xl md:text-3xl font-extrabold text-[#6B2C6B] mb-4">
            270 unique posts from a single upload.
          </p>
          <p className="text-sm text-gray-500 max-w-xl mx-auto mb-3">
            Below: the same product, written natively for all 5 platforms.
          </p>
          <span className="v2-ai-sample-badge">AI sample output</span>
        </div>

        {/* The 5 platform mockups */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Instagram */}
          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#962fbf] p-[2px]">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-[#6B2C6B]">Y</div>
              </div>
              <span className="text-xs font-semibold">@yourbrand</span>
              <span className="ml-auto text-gray-400">⋯</span>
            </div>
            <ProductCard className="aspect-square" />
            <div className="px-3 py-2 text-base">♡ 💬 ↗</div>
            <div className="px-3 pb-3 text-xs leading-relaxed flex-1">
              <span className="font-semibold">@yourbrand</span> Slip on. Walk out the door. Our new white knit sneaker — breathable, lightweight, no laces. Made for grass, gravel, garden paths, the long way home.
              <p className="text-[#6B2C6B] mt-1.5 leading-snug">#NewDrop #SlipOnSneakers #WhiteSneakers #MinimalShoes #KnitSneakers #LifestyleShoes #FirstDrop</p>
            </div>
            <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-mono">
              <span>Instagram</span><span>318/2200 · 7 tags</span>
            </div>
          </article>

          {/* LinkedIn */}
          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="flex items-start gap-2 px-3 py-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6B2C6B] to-[#8B3A8B] flex items-center justify-center text-white font-bold text-xs shrink-0">YB</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">Your Brand</p>
                <p className="text-[10px] text-gray-500 truncate">Footwear · Lifestyle</p>
                <p className="text-[10px] text-gray-400 mt-0.5">2h · 🌐</p>
              </div>
            </div>
            <div className="px-3 pb-3 text-xs leading-relaxed flex-1 space-y-1.5">
              <p className="font-medium">Eighteen months. Eighty pattern revisions. One sneaker.</p>
              <p>We just shipped our first slip-on. White knit upper, single-piece construction, no laces.</p>
              <p>Three things this taught us about building around comfort:</p>
              <p>→ The first prototype is rarely the product</p>
              <p>→ You can&apos;t fake breathability — the knit either works or it doesn&apos;t</p>
              <p>→ Removing friction (laces) is harder than adding features</p>
              <p>Today&apos;s the day. Knit. White. Slip-on.</p>
              <p className="text-[#0a66c2]">#SmallBusiness #FirstDrop</p>
            </div>
            <div className="px-3 py-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
              <span>👍❤️💡 1,247</span><span>184 · 36</span>
            </div>
            <div className="grid grid-cols-4 gap-1 px-1.5 py-1.5 border-t border-gray-100 text-[9px] font-semibold text-gray-600">
              <button className="py-1 hover:bg-gray-50 rounded">👍 Like</button>
              <button className="py-1 hover:bg-gray-50 rounded">💬 Comment</button>
              <button className="py-1 hover:bg-gray-50 rounded">🔄 Repost</button>
              <button className="py-1 hover:bg-gray-50 rounded">📤 Send</button>
            </div>
            <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-mono">
              <span>LinkedIn</span><span>512/3000 · 2 tags</span>
            </div>
          </article>

          {/* X */}
          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="flex items-start gap-2 px-3 py-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-white font-bold text-xs shrink-0">YB</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">Your Brand <span className="text-gray-400 font-normal">@yourbrand · 2h</span></p>
              </div>
              <span className="text-gray-400">⋯</span>
            </div>
            <div className="px-3 pb-3 text-xs leading-relaxed flex-1 space-y-1.5">
              <p>made a slip-on.</p>
              <p>18 months. 80 prototypes. one sneaker.</p>
              <p>it&apos;s white. it&apos;s knit. it has no laces — that took longer than you&apos;d think.</p>
              <p className="text-blue-500">#firstdrop</p>
            </div>
            <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>💬 47</span><span>♻ 128</span><span>♡ 892</span><span>📊 12k</span>
            </div>
            <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-mono">
              <span>X</span><span>178/280 · 1 tag</span>
            </div>
          </article>

          {/* Facebook */}
          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="flex items-start gap-2 px-3 py-3">
              <div className="w-9 h-9 rounded-full bg-[#1877f2] flex items-center justify-center text-white font-bold text-xs shrink-0">YB</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">Your Brand</p>
                <p className="text-[10px] text-gray-500">2h · 🌐</p>
              </div>
            </div>
            <div className="px-3 pb-3 text-xs leading-relaxed flex-1 space-y-1.5">
              <p>Friends 👋 — meet our first sneaker.</p>
              <p>White knit slip-on. Breathable, lightweight, no laces. Eighteen months from sketch to shipped. We obsessed over how it feels in the first ten seconds you put it on (good) and the first ten miles you walk in it (better).</p>
              <p>Slip in. Walk out.</p>
              <p className="font-medium">What color should we make next? Drop your vote in the comments 👇</p>
            </div>
            <div className="px-3 py-2 border-t border-gray-100 grid grid-cols-3 gap-1 text-[10px] text-gray-600 font-semibold">
              <button className="py-1 hover:bg-gray-50 rounded">👍 Like</button>
              <button className="py-1 hover:bg-gray-50 rounded">💬 Comment</button>
              <button className="py-1 hover:bg-gray-50 rounded">↗ Share</button>
            </div>
            <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-mono">
              <span>Facebook</span><span>461/63206 · 0 tags</span>
            </div>
          </article>

          {/* TikTok — light theme, no dark gradient. Caption sits below shoe. */}
          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <ProductCard className="aspect-[9/16]" imgClassName="w-3/4 h-auto -mt-16">
              {/* "For You" pill, top-left */}
              <div className="absolute top-3 left-3 text-[10px] font-semibold text-gray-700 bg-white/80 backdrop-blur px-2 py-0.5 rounded-full border border-gray-200">For You</div>
              {/* engagement column, right side */}
              <div className="absolute right-2 bottom-28 flex flex-col gap-3 text-[#6B2C6B] text-[10px] font-semibold">
                <div className="flex flex-col items-center"><span className="text-lg">♡</span><span>14k</span></div>
                <div className="flex flex-col items-center"><span className="text-lg">💬</span><span>823</span></div>
                <div className="flex flex-col items-center"><span className="text-lg">↗</span><span>2.1k</span></div>
              </div>
              {/* caption block, bottom */}
              <div className="absolute bottom-0 left-0 right-12 p-3 text-[10px] leading-snug">
                <p className="font-bold mb-1 text-gray-900">@yourbrand</p>
                <p className="text-gray-800">POV: 18 months and 80 prototypes later, your first sneaker is here 🤍</p>
                <p className="font-medium mt-1 text-[#6B2C6B]">#shoetok #slipons #firstdrop #whitesneakers</p>
                <p className="text-gray-500 mt-1">♪ original sound</p>
              </div>
            </ProductCard>
            <div className="mt-auto px-3 py-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-mono">
              <span>TikTok</span><span>168/2200 · 5 tags</span>
            </div>
          </article>
        </div>
      </section>

      {/* AUDIENCE TARGETING — 3 cards */}
      <section id="audiences" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Built for people posting <span className="text-[#6B2C6B]">across platforms and languages.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-[#F3E8FF] rounded-xl flex items-center justify-center mb-4 text-[#6B2C6B]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M3 3h18l-2 13H5L3 3z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="20" r="1" /><circle cx="17" cy="20" r="1" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-3">E-commerce sellers</h3>
            <p className="text-gray-600 leading-relaxed">
              Drop a product photo, get captions tuned to where you&apos;re posting and how you sound. No briefs. No content calendars. No staring at a blinking cursor.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-[#F3E8FF] rounded-xl flex items-center justify-center mb-4 text-[#6B2C6B]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 21v-1a8 8 0 0116 0v1" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Solo creators</h3>
            <p className="text-gray-600 leading-relaxed">
              You can&apos;t be &lsquo;on&rsquo; across every platform every day. Klinchapp generates posts that read native to each platform — in the voice you set, the language you choose.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-[#F3E8FF] rounded-xl flex items-center justify-center mb-4 text-[#6B2C6B]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" /><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Global marketers</h3>
            <p className="text-gray-600 leading-relaxed">
              Klinchapp generates posts in 6 languages, including right-to-left Arabic — directly in the target language, not auto-translated. Hashtags localize too.
            </p>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE — vs text-only generators (brand-tinted) */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Not another text-only <span className="text-[#6B2C6B]">caption generator.</span>
          </h2>
          <p className="text-lg text-gray-600">
            Most AI tools start with a text prompt and one platform. Klinchapp starts with what you sell.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[#6B2C6B]/20 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#6B2C6B]/20">
                <th className="text-left p-4 font-bold text-gray-500 uppercase text-xs tracking-wider w-1/4"></th>
                <th className="text-left p-4 font-bold uppercase text-xs tracking-wider bg-[#F3E8FF] text-[#6B2C6B]">Klinchapp</th>
                <th className="text-left p-4 font-bold uppercase text-xs tracking-wider text-gray-500">Text-only AI tools</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="p-4 font-semibold text-gray-700">Input</td>
                <td className="p-4 font-semibold bg-[#F3E8FF]/40 text-gray-900">Product image or text</td>
                <td className="p-4 text-gray-500">Text or URL only</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-4 font-semibold text-gray-700">Languages</td>
                <td className="p-4 font-semibold bg-[#F3E8FF]/40 text-gray-900">6 (incl. RTL Arabic)</td>
                <td className="p-4 text-gray-500">Often EN-only or auto-translate</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-4 font-semibold text-gray-700">Voices</td>
                <td className="p-4 font-semibold bg-[#F3E8FF]/40 text-gray-900">9 distinct tones</td>
                <td className="p-4 text-gray-500">Generic</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-gray-700">Platforms</td>
                <td className="p-4 font-semibold bg-[#F3E8FF]/40 text-gray-900">5 native (IG, LI, X, FB, TikTok)</td>
                <td className="p-4 text-gray-500">One-size-fits-all output</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* TONE DEEP-DIVE */}
      <section id="tones" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F3E8FF] rounded-full text-[#6B2C6B] text-sm font-semibold mb-6">
            Voice deep-dive
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Same image. Same platform. <span className="text-[#6B2C6B]">Nine distinct voices.</span>
          </h2>
          <p className="text-lg text-gray-600 mb-3">
            One white slip-on sneaker, written nine ways for Instagram — the voice you choose is the voice you ship.
          </p>
          <span className="v2-ai-sample-badge">AI sample output</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Professional', tag: 'Mandatory', caption: 'Introducing our first slip-on. White knit upper, breathable, single-piece construction. Available now.', hashtags: '#NewDrop #SlipOnSneakers #MinimalShoes' },
            { name: 'Casual', tag: 'Mandatory', caption: "white slip-ons. knit upper. no laces. that's the whole post. they're online if you're curious 🤍", hashtags: '#slipons #whitesneakers #smallbiz' },
            { name: 'Enthusiastic', tag: 'Mandatory', caption: "THEY'RE HERE!! Our white knit slip-ons just dropped — breathable, no-laces, all-day comfort. We can't stop wearing them. Go get a pair!!", hashtags: '#FirstDrop #LaunchDay #Sneakers' },
            { name: 'Humorous', tag: 'Mandatory', caption: "we made shoes that don't have laces. revolutionary stuff. presenting our slip-on — for people who've decided that bending over to tie shoes is no longer their personality.", hashtags: '#NoLacesNoProblem #SlipOnSneakers' },
            { name: 'Inspirational', tag: 'Mandatory', caption: "Two years of pattern testing for one shoe you can slip on without thinking. The shoe isn't the point. Removing friction is. 🤍", hashtags: '#FirstDrop #MakeTheThing #SlowBrand' },
            { name: 'Luxe', tag: 'Klinchapp', caption: 'Knit. White. Slip-on. A single piece. Made for movement.', hashtags: '#Considered #MinimalShoes #SlowBrand' },
            { name: 'Witty', tag: 'Klinchapp', caption: "We made a slip-on. There are already a hundred slip-ons. Ours has a knit upper that breathes, which we'd call innovation if we weren't a small brand and slightly embarrassed to.", hashtags: '#SlipOnSneakers #SmallBatch' },
            { name: 'Founder', tag: 'Klinchapp', caption: "I spent two years finding a factory that would make one slip-on, in one color, with one upper. They said it wasn't economical. Here's the result. White. Knit. Ours.", hashtags: '#FirstDrop #FounderStory #SmallBusiness' },
            { name: 'Bold', tag: 'Klinchapp', caption: "Most slip-ons are foam in a sock. Ours isn't. Knit upper. Breathable. Built to last beyond the season.", hashtags: '#SlipOnsDoneRight #KnitSneakers' },
          ].map((tone) => (
            <article key={tone.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B2C6B]">{tone.name}</span>
                <span className="text-[10px] text-gray-400 font-mono">{tone.tag}</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-900">{tone.caption}</p>
              <p className="text-xs text-[#6B2C6B] mt-3 leading-snug">{tone.hashtags}</p>
            </article>
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm mt-8 max-w-2xl mx-auto">
          &ldquo;Mandatory&rdquo; = available in the dashboard mood selector today. &ldquo;Klinchapp&rdquo; = additional voices unique to v2.
        </p>
      </section>

      {/* LANGUAGE DEEP-DIVE */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F3E8FF] rounded-full text-[#6B2C6B] text-sm font-semibold mb-6">
            Language deep-dive
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            AI-generated, in six languages. <span className="text-[#6B2C6B]">Including right-to-left Arabic.</span>
          </h2>
          <p className="text-lg text-gray-600 mb-3">
            Same image, six languages. Klinchapp writes like a local — hashtags included.
          </p>
          <span className="v2-ai-sample-badge">AI sample output</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'English', code: 'EN · LTR', body: 'Introducing our first slip-on. White knit upper, breathable, single-piece construction. Available now.', tags: '#NewDrop #SlipOnSneakers', rtl: false },
            { name: 'Español', code: 'ES · LTR', body: 'Presentamos nuestra primera zapatilla slip-on. Empeine de tejido blanco, transpirable, construcción de una sola pieza. Disponible ahora.', tags: '#NuevoLanzamiento #ZapatillasSlipOn', rtl: false },
            { name: 'Português', code: 'PT · LTR', body: 'Apresentamos o nosso primeiro slip-on. Tramado superior branco, respirável, construção em peça única. Disponível agora.', tags: '#NovoLançamento #SlipOn', rtl: false },
            { name: 'Français', code: 'FR · LTR', body: 'Découvrez notre première slip-on. Tige tricotée blanche, respirante, construction monobloc. Disponible dès maintenant.', tags: '#NouveauLancement #SlipOn', rtl: false },
            { name: 'العربية', code: 'AR · RTL', body: 'نقدّم أول حذاء سهل الارتداء لدينا. طبقة علوية محاكة باللون الأبيض، قابلة للتنفس، تصميم من قطعة واحدة. متوفر الآن.', tags: '#إصدار_جديد #حذاء_سهل_الارتداء', rtl: true },
            { name: 'हिन्दी', code: 'HI · LTR', body: 'प्रस्तुत है हमारा पहला Slip-On। सफेद निट अपर, सांस लेने योग्य, एकल-पीस निर्माण। अभी उपलब्ध।', tags: '#नयालॉन्च #स्लिपऑन', rtl: false },
          ].map((lang) => (
            <article
              key={lang.code}
              {...(lang.rtl ? { dir: 'rtl' } : {})}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col"
            >
              <div className="flex items-center justify-between mb-3" {...(lang.rtl ? { dir: 'ltr' } : {})}>
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B2C6B]">{lang.name}</span>
                <span className="text-[10px] text-gray-400 font-mono">{lang.code}</span>
              </div>
              <p className="text-xs leading-relaxed text-gray-900 flex-1">{lang.body}</p>
              <p className="text-[11px] text-[#6B2C6B] mt-3 leading-snug">{lang.tags}</p>
            </article>
          ))}
        </div>

        <div className="text-center mt-8 max-w-2xl mx-auto">
          <p className="text-gray-500 text-sm">Captions shown are placeholder translations for layout review. Native-speaker review before launch.</p>
        </div>
      </section>

      {/* PLATFORM DEEP-DIVES — live-site treatment */}
      <section id="platforms" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-4">Built for every platform</h2>
        <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Pick your platform — Klinchapp tailors captions, hashtags, and tone to where you&apos;re posting.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: 'Instagram', href: `/ai-instagram-post-generator`,    Icon: InstagramIcon, live: true },
            { name: 'LinkedIn',  href: `/ai-linkedin-post-generator`,     Icon: LinkedInIcon,  live: true },
            { name: 'X',         href: `/ai-twitter-post-generator`,      Icon: XIcon,         live: true },
            { name: 'Facebook',  href: `/ai-facebook-post-generator`,     Icon: FacebookIcon,  live: true },
            { name: 'TikTok',    href: `/ai-tiktok-caption-generator`,    Icon: TikTokIcon,    live: true },
          ].map((p) => {
            const card = (
              <div className={`relative h-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center ${p.live ? 'group-hover:shadow-md group-hover:border-[#6B2C6B]/30 transition-all' : 'opacity-70'}`}>
                <div className="w-12 h-12 bg-[#F3E8FF] rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <p.Icon />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{p.name}</h3>
                {p.live ? (
                  <p className="text-sm text-[#6B2C6B] font-semibold">Explore →</p>
                ) : (
                  <p className="text-sm text-gray-400">Coming soon</p>
                )}
              </div>
            )
            return p.href ? (
              <Link key={p.name} href={p.href} className="group">{card}</Link>
            ) : (
              <div key={p.name}>{card}</div>
            )
          })}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Frequently asked questions</h2>
        </div>
        <div className="space-y-3">
          {[
            { q: "I don't have a website. Can I still use Klinchapp?", a: "Yes. Klinchapp starts with your photo or description — not a URL. Sell on Instagram, Etsy, WhatsApp, or nowhere yet, you're covered. There's no integration to set up before you can generate your first post." },
            { q: "What if I don't have a product image?", a: "Klinchapp accepts a text description as well. Image input gets you stronger captions because the AI sees what's visually distinctive about your product — colors, materials, mood — and writes copy that leads with it. Text-only works fine for announcements, milestones, or content where there's no product to photograph." },
            { q: 'Is Klinchapp free to use?', a: 'Yes. The free plan includes 60 AI-generated posts per month across all 5 platforms. No credit card required to start.' },
            { q: 'Will my posts sound like AI?', a: "The output is AI-generated — Klinchapp doesn't pretend otherwise. The voice you choose (Professional, Founder, Witty, etc.) shapes how the caption reads, and you can edit, regenerate, or rewrite before posting. Klinchapp drafts; you ship." },
            { q: 'Which platforms does Klinchapp support?', a: 'Five — Instagram, LinkedIn, X, Facebook, and TikTok. Each post is tuned to the platform\'s character limits, hashtag conventions, and structural quirks. Currently Instagram and LinkedIn have dedicated landing pages; X, Facebook, and TikTok pages launch in upcoming sessions.' },
            { q: 'How many languages does Klinchapp support?', a: 'Six — English, Spanish, Portuguese, French, Arabic (right-to-left), and Hindi. Posts are generated directly in the target language, not translated from English. Hashtags localize too. Hinglish style is supported for Hindi where appropriate.' },
            { q: 'Can I edit captions before posting?', a: 'Yes. Every generated caption is editable. Regenerate, swap hashtags, change tone, or rewrite manually — all in one place.' },
            { q: 'What happens to my data?', a: "Your prompts, uploaded images, and generated content stay in your account. We don't sell or share your data, and we don't use your inputs to train models." },
            { q: 'Can I switch tones across posts?', a: 'Yes. Pick a different voice for each post, or set a default brand voice and override per-platform.' },
          ].map((item, i) => (
            <details key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 group" {...(i === 0 ? { open: true } : {})}>
              <summary className="cursor-pointer list-none flex items-center justify-between p-5 font-semibold">
                <span>{item.q}</span>
                <span className="text-[#6B2C6B] text-2xl leading-none transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="px-5 pb-5 text-gray-600 leading-relaxed">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA — live-site treatment */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-[#6B2C6B] to-[#8B3A8B] rounded-3xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Social Media?</h2>
          <p className="text-lg opacity-90 mb-8">Free plan · 60 posts/month · No credit card required.</p>
          <Link href="/login" className="inline-block px-8 py-4 bg-white text-[#6B2C6B] rounded-xl font-bold text-lg hover:bg-gray-100 transition-all">
            Get Started Free →
          </Link>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-200 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#6B2C6B] flex items-center justify-center text-white font-bold text-xs">K</div>
            <span>Klinchapp · 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#6B2C6B]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#6B2C6B]">Terms</Link>
            <Link href="/contact" className="hover:text-[#6B2C6B]">Contact</Link>
            <Link href="/blog" className="hover:text-[#6B2C6B]">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
