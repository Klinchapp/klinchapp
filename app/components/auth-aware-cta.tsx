'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function AuthAwareCTA() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  if (isLoggedIn) {
    return (
      <Link
        href="/dashboard"
        className="px-3 sm:px-6 py-2 sm:py-2.5 bg-[#6B2C6B] text-white rounded-xl font-semibold hover:bg-[#8B3A8B] transition-all shadow-lg shadow-[#6B2C6B]/20 text-xs sm:text-base"
      >
        <span className="hidden sm:inline">Go to Dashboard</span>
        <span className="sm:hidden">Dashboard</span>
      </Link>
    )
  }

  return (
    <>
      <Link href="/login" className="text-[#6B2C6B] font-semibold hover:underline text-sm sm:text-base">
        Login
      </Link>
      <Link
        href="/login"
        className="px-3 sm:px-6 py-2 sm:py-2.5 bg-[#6B2C6B] text-white rounded-xl font-semibold hover:bg-[#8B3A8B] transition-all shadow-lg shadow-[#6B2C6B]/20 text-xs sm:text-base"
      >
        <span className="hidden sm:inline">Get Started Free</span>
        <span className="sm:hidden">Start</span>
      </Link>
    </>
  )
}
