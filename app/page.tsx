import type { Metadata } from 'next'
import HomeClient from './home-client'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.klinchapp.com',
  },
}

export default function Page() {
  return <HomeClient />
}
