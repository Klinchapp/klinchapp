'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'

// Icons
const CheckIcon = () => (<svg className="w-5 h-5 text-[#6B2C6B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>)
const SparklesIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>)
const LoaderIcon = () => (<svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>)

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // User is logged in, redirect to dashboard
        router.push('/dashboard')
      } else {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [router, supabase])

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDFAFF] to-[#FDF2F8]">
        <LoaderIcon />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFAFF] via-[#FDF2F8] to-[#FFF8F8]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Klinchapp" className="w-12 h-12 rounded-xl object-contain shadow-sm bg-white" />
            <span className="text-xl font-extrabold text-[#6B2C6B]">Klinchapp</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[#6B2C6B] font-semibold hover:underline">Login</Link>
            <Link href="/login" className="px-6 py-2.5 bg-[#6B2C6B] text-white rounded-xl font-semibold hover:bg-[#8B3A8B] transition-all shadow-lg shadow-[#6B2C6B]/20">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F3E8FF] rounded-full text-[#6B2C6B] text-sm font-semibold mb-6">
          <SparklesIcon />
          AI-Powered Social Media Content
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          Create Stunning Social Posts<br />
          <span className="text-[#6B2C6B]">In Seconds</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Upload your product image, select your style, and let AI generate engaging social media content for Instagram, Twitter, LinkedIn, and more.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="px-8 py-4 bg-[#6B2C6B] text-white rounded-xl font-bold text-lg hover:bg-[#8B3A8B] transition-all shadow-xl shadow-[#6B2C6B]/30">
            Start Creating Free →
          </Link>
          <a href="#how-it-works" className="px-8 py-4 bg-white text-[#6B2C6B] rounded-xl font-bold text-lg border-2 border-[#6B2C6B] hover:bg-[#F3E8FF] transition-all">
            See How It Works
          </a>
        </div>
        <p className="mt-6 text-gray-500 text-sm">No credit card required • 60 free posts/month</p>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Klinchapp?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'AI-Powered', desc: 'Advanced AI analyzes your product and creates engaging, platform-optimized content.' },
            { title: 'Multi-Platform', desc: 'Generate content tailored for Instagram, Twitter, LinkedIn, Facebook, and TikTok.' },
            { title: 'Multi-Language', desc: 'Create posts in English, Spanish, Portuguese, French, Arabic, and Hindi.' },
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-[#F3E8FF] rounded-xl flex items-center justify-center mb-4">
                <CheckIcon />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20 bg-white rounded-3xl my-10">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Upload', desc: 'Upload your product image or describe your content.' },
            { step: '2', title: 'Customize', desc: 'Choose platform, mood, language, and features to highlight.' },
            { step: '3', title: 'Generate', desc: 'Get AI-generated content ready to post in seconds.' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 bg-[#6B2C6B] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-[#6B2C6B] to-[#8B3A8B] rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Social Media?</h2>
          <p className="text-lg opacity-90 mb-8">Join thousands of creators and businesses using Klinchapp.</p>
          <Link href="/login" className="inline-block px-8 py-4 bg-white text-[#6B2C6B] rounded-xl font-bold text-lg hover:bg-gray-100 transition-all">
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Klinchapp" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-[#6B2C6B]">Klinchapp</span>
          </div>
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
