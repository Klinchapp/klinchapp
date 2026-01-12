import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/auth/'],
      },
    ],
    sitemap: 'https://www.klinchapp.com/sitemap.xml',
  }
}
