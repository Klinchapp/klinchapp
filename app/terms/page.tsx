import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFAFF] via-[#FDF2F8] to-[#FFF8F8] flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white shadow-lg flex items-center justify-center overflow-hidden border border-gray-100">
              <img src="/logo.jpg" alt="Klinchapp" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-extrabold text-[#6B2C6B]">Klinchapp</span>
          </Link>
          <Link href="/login" className="px-5 py-2.5 bg-[#6B2C6B] text-white rounded-xl font-semibold hover:bg-[#5a245a] transition-colors">
            Sign In
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold text-[#6B2C6B] mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">Last updated: January 2026</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing and using Klinchapp, you accept and agree to be bound by the terms and conditions of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 leading-relaxed">
              Klinchapp provides an AI-powered platform for creating and managing social media content. Our service includes content generation, image analysis, and post scheduling features.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">3. User Responsibilities</h2>
            <p className="text-gray-600 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You agree not to use the service for any unlawful purpose or to upload inappropriate content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Content Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              Users must not upload content that is offensive, inappropriate, or violates any laws. We reserve the right to remove any content that violates our policies and to terminate accounts of repeat offenders.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              The content you create using Klinchapp remains your property. However, you grant us a license to use, modify, and display your content as necessary to provide our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              Klinchapp shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at support@klinchapp.com.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/" className="text-[#6B2C6B] font-semibold hover:underline">
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}
