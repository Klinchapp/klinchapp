import Link from 'next/link'
import AuthAwareCTA from './auth-aware-cta'

type Variant = 'marketing' | 'marketing-home' | 'blog-index' | 'back-home' | 'back-blog'

const LOGO_CLASSES = 'w-14 h-14 sm:w-20 sm:h-20 rounded-xl object-contain'

function MarketingNav() {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <Link href="/blog" className="text-[#6B2C6B] font-semibold hover:underline text-sm sm:text-base">Blog</Link>
      <AuthAwareCTA />
    </div>
  )
}

function BlogIndexNav() {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <Link href="/blog" className="text-[#6B2C6B] font-semibold hover:underline text-sm sm:text-base">Blog</Link>
      <AuthAwareCTA />
    </div>
  )
}

function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-[#6B2C6B] font-semibold hover:underline text-sm sm:text-base">
      {label}
    </Link>
  )
}

export default function SiteHeader({ variant = 'marketing' }: { variant?: Variant }) {
  if (variant === 'marketing-home') {
    return (
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <img src="/logo.jpg" alt="Klinchapp" className={LOGO_CLASSES} />
            <span className="text-lg sm:text-xl font-extrabold text-[#6B2C6B]">Klinchapp</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-gray-700">
            <a href="#how" className="hover:text-[#6B2C6B]">How it works</a>
            <a href="#audiences" className="hover:text-[#6B2C6B]">Who it&apos;s for</a>
            <a href="#tones" className="hover:text-[#6B2C6B]">Voices</a>
            <a href="#platforms" className="hover:text-[#6B2C6B]">Platforms</a>
            <a href="#faq" className="hover:text-[#6B2C6B]">FAQ</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/blog" className="text-[#6B2C6B] font-semibold hover:underline text-sm sm:text-base">Blog</Link>
            <AuthAwareCTA />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <img src="/logo.jpg" alt="Klinchapp" className={LOGO_CLASSES} />
          <span className="text-lg sm:text-xl font-extrabold text-[#6B2C6B]">Klinchapp</span>
        </Link>
        {variant === 'marketing' && <MarketingNav />}
        {variant === 'blog-index' && <BlogIndexNav />}
        {variant === 'back-home' && <BackLink href="/" label="← Home" />}
        {variant === 'back-blog' && <BackLink href="/blog" label="← Blog" />}
      </div>
    </header>
  )
}
