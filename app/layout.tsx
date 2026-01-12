import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// ===========================================
// SEO METADATA
// ===========================================
export const metadata: Metadata = {
  // Basic
  title: {
    default: 'Klinchapp - AI-Powered Social Media Post Generator',
    template: '%s | Klinchapp'
  },
  description: 'Create engaging social media posts in seconds with AI. Generate platform-optimized content for Instagram, Twitter/X, LinkedIn, Facebook & TikTok. Free 60 posts/month.',
  keywords: [
    'social media post generator',
    'AI content creator',
    'Instagram post generator',
    'Twitter post generator',
    'LinkedIn post generator',
    'Facebook post generator',
    'TikTok caption generator',
    'AI marketing tool',
    'social media automation',
    'free social media tool'
  ],
  authors: [{ name: 'Klinchapp', url: 'https://www.klinchapp.com' }],
  creator: 'Klinchapp',
  publisher: 'Klinchapp',
  
  // Canonical URL
  metadataBase: new URL('https://www.klinchapp.com'),
  alternates: {
    canonical: '/',
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Open Graph (Facebook, LinkedIn, WhatsApp, etc.)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.klinchapp.com',
    siteName: 'Klinchapp',
    title: 'Klinchapp - AI-Powered Social Media Post Generator',
    description: 'Create engaging social media posts in seconds with AI. Works with Instagram, Twitter/X, LinkedIn, Facebook & TikTok.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Klinchapp - AI Social Media Post Generator',
      }
    ],
  },
  
  // Twitter/X
  twitter: {
    card: 'summary_large_image',
    title: 'Klinchapp - AI-Powered Social Media Post Generator',
    description: 'Create engaging social media posts in seconds with AI. Free to start!',
    images: ['/og-image.png'],
    creator: '@klinchapp',
  },
  
  // Icons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  
  // Manifest
  manifest: '/manifest.json',
  
  // App info
  applicationName: 'Klinchapp',
  category: 'Technology',
  
  // Verification (add your codes when you have them)
  // verification: {
  //   google: 'your-google-verification-code',
  // },
}

// ===========================================
// VIEWPORT
// ===========================================
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6B2C6B',
}

// ===========================================
// STRUCTURED DATA (JSON-LD)
// ===========================================
const jsonLd = {
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
      sameAs: [
        'https://twitter.com/klinchapp',
        'https://www.instagram.com/klinchapp',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.klinchapp.com/#website',
      url: 'https://www.klinchapp.com',
      name: 'Klinchapp',
      description: 'AI-Powered Social Media Post Generator',
      publisher: {
        '@id': 'https://www.klinchapp.com/#organization',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Klinchapp',
      description: 'AI-powered social media post generator for Instagram, Twitter/X, LinkedIn, Facebook, and TikTok.',
      url: 'https://www.klinchapp.com',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free tier with 60 posts per month',
      },
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
