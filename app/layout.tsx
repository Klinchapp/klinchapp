import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = 'https://www.klinchapp.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Klinchapp - AI-Powered Social Media Post Generator',
    template: '%s | Klinchapp'
  },
  description: 'Create stunning social media posts in seconds. Upload your product image and let AI generate engaging content for Instagram, Twitter, LinkedIn, Facebook, and TikTok.',
  keywords: ['social media', 'AI content generator', 'Instagram posts', 'Twitter posts', 'LinkedIn posts', 'content creator', 'marketing tool'],
  authors: [{ name: 'Klinchapp' }],
  creator: 'Klinchapp',
  publisher: 'Klinchapp',
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
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Klinchapp',
    title: 'Klinchapp - AI-Powered Social Media Post Generator',
    description: 'Create stunning social media posts in seconds with AI. Upload your product image and generate engaging content for all platforms.',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Klinchapp - AI Social Media Post Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Klinchapp - AI-Powered Social Media Post Generator',
    description: 'Create stunning social media posts in seconds with AI.',
    images: [`${siteUrl}/og-image.jpg`],
    creator: '@klinchapp',
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
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
