import type { Metadata } from 'next'
import { PlatformPage } from '@/app/components/platform-page'
import { twitterConfig as config } from '@/lib/platforms/twitter'

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
  alternates: { canonical: `https://www.klinchapp.com/${config.routePath}` },
  openGraph: {
    type: 'website',
    url: `https://www.klinchapp.com/${config.routePath}`,
    siteName: 'Klinchapp',
    title: config.metaTitle,
    description: config.metaDescription,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `Klinchapp ${config.metaTitle}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: config.metaTitle,
    description: config.metaDescription,
    images: ['/og-image.png'],
  },
}

export default function Page() {
  return <PlatformPage config={config} />
}
