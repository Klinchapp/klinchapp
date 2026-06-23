import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.klinchapp.com'),
  title: {
    default: 'Klinchapp - AI-Powered Social Media Post Creator',
    template: '%s | Klinchapp'
  },
  description: 'AI social media post generator for Instagram, LinkedIn, X, Facebook & TikTok. Generate scroll-stopping captions in seconds. Free plan, no credit card.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.klinchapp.com',
    siteName: 'Klinchapp',
    title: 'Klinchapp - Create. Post. Nail It.',
    description: 'Upload your product, pick your platform, and let AI craft scroll-stopping content.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Klinchapp - AI Social Media Post Creator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Klinchapp - Create. Post. Nail It.',
    description: 'Upload your product, pick your platform, and let AI craft scroll-stopping content.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <link rel="alternate" type="application/rss+xml" title="Klinchapp Blog" href="/blog/rss.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': 'https://www.klinchapp.com/#organization',
                name: 'Klinchapp',
                url: 'https://www.klinchapp.com',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://www.klinchapp.com/logo.jpg',
                },
                description: 'Klinchapp is an AI social media post generator that creates platform-specific content for Instagram, TikTok, LinkedIn, X, and Facebook. Klinchapp publishes research-backed analysis on AI content creation, AI tools, and AI for business through its blog.',
                knowsAbout: [
                  'AI content creation',
                  'AI social media post generation',
                  'AI writing tools',
                  'Content marketing strategy',
                  'AI for small business',
                  'Brand voice and AI',
                  'AI content ethics',
                  'Social media content strategy',
                ],
                sameAs: [
                  'https://klinchapp.blogspot.com',
                  'https://kirasaiblog.wordpress.com',
                  'https://bsky.app/profile/klinchapp.com',
                ],
              },
              {
                '@type': 'WebSite',
                '@id': 'https://www.klinchapp.com/#website',
                url: 'https://www.klinchapp.com',
                name: 'Klinchapp',
                description: 'AI social media post generator for Instagram, LinkedIn, X, Facebook & TikTok.',
                publisher: { '@id': 'https://www.klinchapp.com/#organization' },
              },
            ],
          }) }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-NX5T2DB7CL"></script>
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-NX5T2DB7CL');` }} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
