'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

const LogOutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
)

export default function AuthAwareCTA() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [avatarError, setAvatarError] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAvatarError(false)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (user) {
    return (
      <>
        <Link
          href="/dashboard"
          className="px-3 sm:px-6 py-2 sm:py-2.5 bg-[#6B2C6B] text-white rounded-xl font-semibold hover:bg-[#8B3A8B] transition-all shadow-lg shadow-[#6B2C6B]/20 text-xs sm:text-base"
        >
          <span className="hidden sm:inline">Generate Posts →</span>
          <span className="sm:hidden">Generate →</span>
        </Link>
        {user.user_metadata?.avatar_url && !avatarError ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="Profile"
            className="w-8 h-8 rounded-full"
            onError={() => setAvatarError(true)}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#6B2C6B] text-white flex items-center justify-center text-sm font-bold uppercase">
            {(user.email?.[0] || '?').toUpperCase()}
          </div>
        )}
        <button
          onClick={signOut}
          className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          title="Sign Out"
        >
          <LogOutIcon />
        </button>
      </>
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
        <span className="hidden sm:inline">Generate Posts →</span>
        <span className="sm:hidden">Generate →</span>
      </Link>
    </>
  )
}
