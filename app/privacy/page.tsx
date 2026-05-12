import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '../components/site-header'
import SiteFooter from '../components/site-footer'

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
      <SiteHeader variant="back-home" />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: May 2026</p>

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

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. International Users and GDPR</h2>
            <p className="text-gray-600 mb-4">If you access the Service from the European Economic Area (EEA), the United Kingdom, or Switzerland, you have additional rights under the General Data Protection Regulation (GDPR) and equivalent laws, including: the right to be informed about how your data is processed; the right of access to your personal data; the right to rectification of inaccurate data; the right to erasure (the &quot;right to be forgotten&quot;); the right to restrict processing; the right to data portability; the right to object to processing; and the right to lodge a complaint with your local data protection authority.</p>
            <p className="text-gray-600 mb-4">We process your data on the legal bases of legitimate interest (operating and improving the Service), contract performance (delivering the Service you signed up for), and consent (where required, such as for marketing communications). Where personal data is transferred outside the EEA, UK, or Switzerland, we rely on adequate safeguards such as Standard Contractual Clauses with our service providers.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. California Privacy Rights (CCPA/CPRA)</h2>
            <p className="text-gray-600 mb-4">If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), including: the right to know what personal information we collect, use, and disclose; the right to delete your personal information; the right to correct inaccurate personal information; the right to opt out of the sale or sharing of your personal information; and the right to non-discrimination for exercising these rights. We do not sell your personal information, and we do not knowingly collect personal information from California residents under 16 without affirmative consent.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Data Retention</h2>
            <p className="text-gray-600 mb-4">We retain your account information as long as your account is active. Generated content history is retained for your reference. You can request deletion of your data at any time.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11. Children&apos;s Privacy</h2>
            <p className="text-gray-600 mb-4">Our Service is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">12. Changes to This Policy</h2>
            <p className="text-gray-600 mb-4">We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">13. Contact Us</h2>
            <p className="text-gray-600 mb-4">If you have questions about this Privacy Policy, please <Link href="/contact" className="text-[#6B2C6B] hover:underline">contact us</Link>.</p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
