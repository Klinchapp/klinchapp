import Link from 'next/link'

// Monoline SVG Icons
const RocketIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
)

const BoltIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
)

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
)

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A1D4A] via-[#6B2C6B] to-[#4A1D4A] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-[radial-gradient(circle,rgba(236,72,153,0.15)_0%,transparent_70%)] rounded-full" />
      <div className="absolute bottom-[-30%] left-[-30%] w-[80%] h-[80%] bg-[radial-gradient(circle,rgba(249,112,102,0.1)_0%,transparent_70%)] rounded-full" />
      
      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white shadow-lg flex items-center justify-center overflow-hidden">
            <img 
              src="/logo.jpg" 
              alt="Klinchapp" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-2xl font-extrabold text-white">Klinchapp</span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="px-6 py-2.5 text-white font-semibold hover:bg-white/10 rounded-lg transition-all"
          >
            Sign In
          </Link>
          <Link 
            href="/login" 
            className="px-6 py-2.5 bg-white text-[#6B2C6B] font-bold rounded-xl hover:shadow-xl transition-all"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Create. Post.<br />
            <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
              Nail It.
            </span>
          </h1>
          
          <p className="text-xl text-white/80 leading-relaxed mb-10 max-w-2xl">
            Upload your product, pick your platform, and let AI craft scroll-stopping content. 
            Then post directly — no copy-paste needed.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link 
              href="/login" 
              className="px-8 py-4 bg-white text-[#6B2C6B] font-bold text-lg rounded-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              <RocketIcon />
              Start Creating Free
            </Link>
            <a 
              href="#features" 
              className="px-8 py-4 border-2 border-white/30 text-white font-semibold text-lg rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              See How It Works
            </a>
          </div>

          {/* Features - MONOLINE ICONS */}
          <div id="features" className="space-y-4">
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
                <RocketIcon />
              </div>
              <span className="text-lg">Direct posting to all major platforms</span>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
                <BoltIcon />
              </div>
              <span className="text-lg">AI-powered content in seconds</span>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
                <ChartIcon />
              </div>
              <span className="text-lg">Track all your posts in one place</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-8 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            © 2026 Klinchapp. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-white/60 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-white/60 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
