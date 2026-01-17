import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Klinchapp Privacy Policy - Learn how we collect, use, and protect your personal information.',
  alternates: {
    canonical: 'https://www.klinchapp.com/privacy',
  },
  openGraph: {
    title: 'Privacy Policy | Klinchapp',
    description: 'Klinchapp Privacy Policy',
    url: 'https://www.klinchapp.com/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFAFF] via-[#FDF2F8] to-[#FFF8F8]">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Klinchapp" className="w-10 h-10 rounded-xl object-contain shadow-sm bg-white" />
            <span className="text-xl font-extrabold text-[#6B2C6B]">Klinchapp</span>
          </Link>
          <Link href="/" className="text-[#6B2C6B] font-semibold hover:underline">← Home</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2026</p>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 mb-4">We collect information you provide directly to us, including: account information (email address, name); content you upload (images for post generation); usage data (posts generated, platforms used); and authentication data when using third-party login (Google).</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use the information we collect to: provide, maintain, and improve our Service; process and generate social media content; send you technical notices and support messages; and monitor and analyze trends and usage.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Image Processing</h2>
            <p className="text-gray-600 mb-4">Images you upload are processed by our AI to generate content. We use image safety checks to ensure appropriate content. Images are temporarily processed and are not permanently stored after content generation is complete.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Data Security</h2>
            <p className="text-gray-600 mb-4">We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Third-Party Services</h2>
            <p className="text-gray-600 mb-4">We use third-party services including: Supabase for authentication and database; Anthropic Claude for AI content generation; Google for OAuth authentication; and Vercel for hosting.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Cookies and Tracking</h2>
            <p className="text-gray-600 mb-4">We use essential cookies for authentication and session management. We may use analytics to understand how our Service is used.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Your Rights</h2>
            <p className="text-gray-600 mb-4">You have the right to: access your personal data; request correction of your data; request deletion of your account and data; and opt out of marketing communications.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Data Retention</h2>
            <p className="text-gray-600 mb-4">We retain your account information as long as your account is active. Generated content history is retained for your reference. You can request deletion of your data at any time.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-600 mb-4">Our Service is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-600 mb-4">We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11. Contact Us</h2>
            <p className="text-gray-600 mb-4">If you have questions about this Privacy Policy, please contact us at privacy@klinchapp.com.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white/50 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2026 Klinchapp. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-[#6B2C6B] text-sm font-medium hover:underline">Terms</Link>
            <Link href="/privacy" className="text-[#6B2C6B] text-sm font-medium hover:underline">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
