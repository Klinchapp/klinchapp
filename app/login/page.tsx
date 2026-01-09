'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'

// Monoline SVG Icons
const RocketIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
)

const BoltIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
)

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
)

const EnvelopeIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
)

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageSent, setMessageSent] = useState(false)
  
  const supabase = createClient()

  const signInWithGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setMessage(error.message)
      setLoading(false)
    }
  }

  const signInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
    } else {
      setMessageSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#4A1D4A] via-[#6B2C6B] to-[#4A1D4A] p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-[radial-gradient(circle,rgba(236,72,153,0.15)_0%,transparent_70%)] rounded-full" />
        <div className="absolute bottom-[-30%] left-[-30%] w-[80%] h-[80%] bg-[radial-gradient(circle,rgba(249,112,102,0.1)_0%,transparent_70%)] rounded-full" />
        
        <div className="relative z-10 max-w-md">
          {/* Logo - LARGER SIZE with white background */}
          <div className="flex items-center gap-5 mb-12">
            <div className="w-24 h-24 rounded-2xl shadow-xl border-2 border-white/20 bg-white flex items-center justify-center overflow-hidden">
              <img 
                src="/logo.jpg" 
                alt="Klinchapp" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-3xl font-extrabold text-white">Klinchapp</span>
          </div>
          
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-6">
            Create. Post.<br />
            <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
              Nail It.
            </span>
          </h1>
          
          <p className="text-lg text-white/80 leading-relaxed mb-12">
            Upload your product, pick your platform, and let AI craft scroll-stopping content. 
            Then post directly — no copy-paste needed.
          </p>
          
          {/* Features - MONOLINE ICONS */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center">
                <RocketIcon />
              </div>
              <span>Direct posting to all major platforms</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center">
                <BoltIcon />
              </div>
              <span>AI-powered content in seconds</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center">
                <ChartIcon />
              </div>
              <span>Track all your posts in one place</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-[#FDFAFF] via-[#FDF2F8] to-[#FFF8F8]">
        <div className="w-full max-w-md">
          {/* Back to home */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#6B2C6B] mb-8 text-sm font-medium transition-colors"
          >
            <ArrowLeftIcon />
            Back to home
          </Link>

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-4 mb-8">
            <img 
              src="/logo.jpg" 
              alt="Klinchapp" 
              className="w-20 h-20 rounded-xl object-contain shadow-lg bg-white/50"
            />
            <span className="text-2xl font-extrabold text-[#6B2C6B]">Klinchapp</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-[#6B2C6B] mb-2">
              Welcome to Klinchapp
            </h2>
            <p className="text-gray-600">Sign in to start creating amazing posts</p>
          </div>

          {!messageSent ? (
            <>
              {/* Google Sign In */}
              <button
                onClick={signInWithGoogle}
                disabled={loading}
                className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 flex items-center justify-center gap-3 hover:border-[#6B2C6B] hover:shadow-lg transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Connecting...' : 'Continue with Google'}
              </button>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-400">or continue with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Email Form */}
              <form onSubmit={signInWithEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#6B2C6B] focus:ring-2 focus:ring-[#6B2C6B]/10 outline-none transition-all"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full p-4 bg-gradient-to-r from-[#6B2C6B] via-[#8B3A8B] to-[#6B2C6B] text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'Sending...'
                  ) : (
                    <>
                      Send Magic Link
                      <SparklesIcon />
                    </>
                  )}
                </button>
              </form>

              {message && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {message}
                </div>
              )}
            </>
          ) : (
            /* Magic Link Sent - PURPLE BRAND COLORS */
            <div className="text-center p-8 bg-gradient-to-br from-[#F3E8FF] to-[#FCE7F3] border-2 border-[#6B2C6B] rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-r from-[#6B2C6B] to-[#8B3A8B] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md text-white">
                <EnvelopeIcon />
              </div>
              <h3 className="text-xl font-bold text-[#6B2C6B] mb-2">Check your inbox!</h3>
              <p className="text-[#6B2C6B]/80">
                We've sent a magic link to<br />
                <span className="font-bold text-[#6B2C6B]">{email}</span><br />
                Click the link to sign in instantly.
              </p>
              <p className="text-sm text-[#6B2C6B]/60 mt-4">
                Didn't receive it? Check your spam folder.
              </p>
            </div>
          )}

          {/* Terms and Privacy links */}
          <p className="text-center mt-8 text-sm text-gray-400 leading-relaxed">
            By continuing, you agree to our<br />
            <Link href="/terms" className="text-[#6B2C6B] font-medium hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[#6B2C6B] font-medium hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
