import Link from 'next/link'

type Variant = 'marketing' | 'blog-index' | 'back-home' | 'back-blog'

const LOGO_CLASSES = 'w-14 h-14 sm:w-20 sm:h-20 rounded-xl object-contain shadow-sm bg-white'

function MarketingNav() {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <Link href="/blog" className="text-[#6B2C6B] font-semibold hover:underline text-sm sm:text-base">Blog</Link>
      <Link href="/login" className="text-[#6B2C6B] font-semibold hover:underline text-sm sm:text-base">Login</Link>
      <Link href="/login" className="px-3 sm:px-6 py-2 sm:py-2.5 bg-[#6B2C6B] text-white rounded-xl font-semibold hover:bg-[#8B3A8B] transition-all shadow-lg shadow-[#6B2C6B]/20 text-xs sm:text-base">
        <span className="hidden sm:inline">Get Started Free</span>
        <span className="sm:hidden">Start</span>
      </Link>
    </div>
  )
}

function BlogIndexNav() {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <Link href="/blog" className="text-[#6B2C6B] font-semibold hover:underline text-sm sm:text-base">Blog</Link>
      <Link href="/login" className="px-3 sm:px-6 py-2 sm:py-2.5 bg-[#6B2C6B] text-white rounded-xl font-semibold hover:bg-[#8B3A8B] transition-all shadow-lg shadow-[#6B2C6B]/20 text-xs sm:text-base">
        <span className="hidden sm:inline">Get Started Free</span>
        <span className="sm:hidden">Start</span>
      </Link>
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
