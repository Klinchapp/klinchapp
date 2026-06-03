'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

interface Props {
  label?: string
  className?: string
}

export default function StartCreatingCTA({
  label = 'Generate Posts →',
  className,
}: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

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

  const href = isLoggedIn ? '/dashboard' : '/login'

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  )
}
