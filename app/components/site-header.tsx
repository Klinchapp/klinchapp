'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import AuthAwareCTA from './auth-aware-cta'

type Variant = 'marketing' | 'marketing-home' | 'blog-index' | 'back-home' | 'back-blog'

const LOGO_CLASSES = 'w-14 h-14 sm:w-20 sm:h-20 rounded-xl object-contain'

const NAV_LINKS = [
  { href: '/#how', label: 'How it works' },
  { href: '/#audiences', label: "Who it's for" },
  { href: '/#tones', label: 'Voices' },
  { href: '/#platforms', label: 'Platforms' },
  { href: '/#faq', label: 'FAQ' },
]

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
      {NAV_LINKS.map(({ href, label }) => (
        <Link key={href} href={href} className="hover:text-[#6B2C6B]">{label}</Link>
      ))}
    </nav>
  )
}

const HamburgerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function SiteHeader({ variant = 'marketing' }: { variant?: Variant }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const showMobileMenu = variant === 'marketing-home'

  return (
    <header ref={headerRef} className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
        <LogoBlock />
        <CenterNav />
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/blog" className="text-[#6B2C6B] font-semibold hover:underline text-sm sm:text-base">Blog</Link>
          <AuthAwareCTA />
          {showMobileMenu && (
            <button
              className="md:hidden p-2 text-gray-700 hover:text-[#6B2C6B] transition-colors"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>
          )}
        </div>
      </div>
      {showMobileMenu && menuOpen && (
        <nav className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl px-6 py-4">
          <div className="flex flex-col">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="py-3 text-base font-semibold text-gray-700 hover:text-[#6B2C6B] border-b border-gray-100 last:border-0 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
