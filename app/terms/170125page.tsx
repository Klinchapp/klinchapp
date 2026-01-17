import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFAFF] via-[#FDF2F8] to-[#FFF8F8] flex flex-col">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Klinchapp" className="w-12 h-12 rounded-xl object-contain shadow-sm bg-white" />
            <span className="text-xl font-extrabold text-[#6B2C6B]">Klinchapp</span>
          </Link>
          <Link href="/login" className="px-5 py-2.5 bg-[#6B2C6B] text-white rounded-xl font-semibold hover:bg-[#5a245a] transition-colors">
            Sign In
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 flex-1">
        <h1 className="text-4xl font-extrabold text-[#6B2C6B] mb-8">Terms of Service</h1>
        <p className="text-gray-600 mb-6">Last updated: January 2026</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed">By accessing and using Klinchapp, you accept and agree to be bound by the terms and conditions of this agreement.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Description of Service</h2>
          <p className="text-gray-600 leading-relaxed">Klinchapp provides an AI-powered platform for creating and managing social media content.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">3. User Responsibilities</h2>
          <p className="text-gray-600 leading-relaxed">You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Content Policy</h2>
          <p className="text-gray-600 leading-relaxed">Users must not upload content that is offensive, inappropriate, or violates any laws.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Contact Us</h2>
          <p className="text-gray-600 leading-relaxed">If you have any questions, please contact us at support@klinchapp.com.</p>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/" className="text-[#6B2C6B] font-semibold hover:underline">← Back to Home</Link>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white/50">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2026 Klinchapp. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-[#6B2C6B] text-sm font-medium hover:underline">Terms of Service</Link>
            <Link href="/privacy" className="text-[#6B2C6B] text-sm font-medium hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}