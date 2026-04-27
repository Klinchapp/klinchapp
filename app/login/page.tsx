import type { Metadata } from 'next'
import LoginClient from './login-client'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to Klinchapp to start creating AI-powered social media content.',
  alternates: {
    canonical: 'https://www.klinchapp.com/login',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function Page() {
  return <LoginClient />
}
