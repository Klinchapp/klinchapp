import type { Metadata } from 'next'
import Link from 'next/link'
import ContactForm from './contact-form'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Klinchapp. Questions about your account, privacy, or anything else — we typically reply within 1–2 business days.',
  alternates: {
    canonical: 'https://www.klinchapp.com/contact',
  },
  openGraph: {
    title: 'Contact Us | Klinchapp',
    description: 'Get in touch with Klinchapp. We typically reply within 1–2 business days.',
    url: 'https://www.klinchapp.com/contact',
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFAFF] via-[#FDF2F8] to-[#FFF8F8]">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Klinchapp" className="w-16 h-16 rounded-xl object-contain shadow-sm bg-white" />
            <span className="text-xl font-extrabold text-[#6B2C6B]">Klinchapp</span>
          </Link>
          <Link href="/" className="text-[#6B2C6B] font-semibold hover:underline">← Home</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Get in touch</h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Questions about your account, privacy, or anything else? Send us a message and we'll get back to you.
          </p>
        </div>

        <ContactForm />
      </main>

      <footer className="border-t border-gray-200 bg-white/50 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Klinchapp" className="w-16 h-16 rounded-xl object-contain shadow-sm bg-white" />
            <span className="font-bold text-[#6B2C6B]">Klinchapp</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 Klinchapp. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/contact" className="text-[#6B2C6B] text-sm font-medium hover:underline">Contact</Link>
            <Link href="/terms" className="text-[#6B2C6B] text-sm font-medium hover:underline">Terms</Link>
            <Link href="/privacy" className="text-[#6B2C6B] text-sm font-medium hover:underline">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
