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
  description: 'Create scroll-stopping social media posts in seconds. Upload your product image and let AI craft engaging content for Instagram, Twitter, LinkedIn, Facebook, and TikTok.',
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
      <body className={inter.className}>{children}</body>
    </html>
  )
}
