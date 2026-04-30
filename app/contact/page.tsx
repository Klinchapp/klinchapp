import type { Metadata } from 'next'
import ContactForm from './contact-form'
import SiteHeader from '../components/site-header'
import SiteFooter from '../components/site-footer'

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
      <SiteHeader variant="back-home" />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Get in touch</h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Questions about your account, privacy, or anything else? Send us a message and we'll get back to you.
          </p>
        </div>

        <ContactForm />
      </main>

      <SiteFooter />
    </div>
  )
}
