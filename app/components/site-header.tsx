import Link from 'next/link'
import AuthAwareCTA from './auth-aware-cta'

type Variant = 'marketing' | 'marketing-home' | 'blog-index' | 'back-home' | 'back-blog'

const LOGO_CLASSES = 'w-14 h-14 sm:w-20 sm:h-20 rounded-xl object-contain'

function LogoBlock() {
  return (
    <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
      <img src="/logo.jpg" alt="Klinchapp" className={LOGO_CLASSES} />
      <div className="flex flex-col">
        <span className="text-lg sm:text-xl font-extrabold text-[#6B2C6B] leading-none">Klinchapp</span>
        <span className="text-[10px] sm:text-xs font-semibold text-[#6B2C6B]/70 leading-tight mt-0.5">AI Social Media Post Generator</span>
      </div>
    </Link>
  )
}

function CenterNav() {
  return (
    <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-gray-700">
      <Link href="/#how" className="hover:text-[#6B2C6B]">How it works</Link>
      <Link href="/#audiences" className="hover:text-[#6B2C6B]">Who it&apos;s for</Link>
      <Link href="/#tones" className="hover:text-[#6B2C6B]">Voices</Link>
      <Link href="/#platforms" className="hover:text-[#6B2C6B]">Platforms</Link>
      <Link href="/#faq" className="hover:text-[#6B2C6B]">FAQ</Link>
    </nav>
  )
}

function RightNav() {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <Link href="/blog" className="text-[#6B2C6B] font-semibold hover:underline text-sm sm:text-base">Blog</Link>
      <AuthAwareCTA />
    </div>
  )
}

export default function SiteHeader({ variant = 'marketing' }: { variant?: Variant }) {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
        <LogoBlock />
        <CenterNav />
        <RightNav />
      </div>
    </header>
  )
}
