import Link from 'next/link'

const LOGO_CLASSES = 'w-14 h-14 sm:w-20 sm:h-20 rounded-xl object-contain'

export default function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white/50 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Klinchapp" className={LOGO_CLASSES} />
          <span className="font-bold text-[#6B2C6B]">Klinchapp</span>
        </Link>
        <p className="text-gray-500 text-sm">© 2026 Klinchapp. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/blog" className="text-[#6B2C6B] text-sm font-medium hover:underline">Blog</Link>
          <Link href="/about" className="text-[#6B2C6B] text-sm font-medium hover:underline">About</Link>
          <Link href="/contact" className="text-[#6B2C6B] text-sm font-medium hover:underline">Contact</Link>
          <Link href="/terms" className="text-[#6B2C6B] text-sm font-medium hover:underline">Terms</Link>
          <Link href="/privacy" className="text-[#6B2C6B] text-sm font-medium hover:underline">Privacy</Link>
        </div>
      </div>
    </footer>
  )
}
