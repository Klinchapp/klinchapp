import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllSeries, getSeriesBySlug, getPostsBySeries } from '@/lib/blog'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const series = getAllSeries()
  return series.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const series = getSeriesBySlug(params.slug)
  if (!series) return {}

  return {
    title: series.title,
    description: series.description,
    alternates: { canonical: `https://www.klinchapp.com/blog/series/${series.slug}` },
    openGraph: {
      title: `${series.title} | Klinchapp Blog`,
      description: series.description,
      url: `https://www.klinchapp.com/blog/series/${series.slug}`,
    },
  }
}

export default function SeriesPage({ params }: { params: { slug: string } }) {
  const series = getSeriesBySlug(params.slug)
  if (!series) notFound()

  const publishedPosts = getPostsBySeries(series.slug)
  const publishedSlugs = new Set(publishedPosts.map(p => p.slug))
  const publishedCount = series.posts.filter(p => p.status === 'published').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFAFF] via-[#FDF2F8] to-[#FFF8F8]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <img src="/logo.jpg" alt="Klinchapp" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain shadow-sm bg-white" />
            <span className="text-lg sm:text-xl font-extrabold text-[#6B2C6B]">Klinchapp</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/blog" className="text-[#6B2C6B] font-semibold hover:underline text-sm sm:text-base">← Blog</Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          {/* Series Header */}
          <div className="mb-8 pb-8 border-b border-gray-100">
            <span className="inline-block px-3 py-1.5 bg-[#F3E8FF] text-[#6B2C6B] rounded-full text-sm font-medium mb-4">
              Series · {publishedCount} of {series.totalPosts} published
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{series.title}</h1>
            <p className="text-gray-600">{series.description}</p>

            {/* Progress bar */}
            <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-[#6B2C6B] h-2 rounded-full transition-all"
                style={{ width: `${(publishedCount / series.totalPosts) * 100}%` }}
              />
            </div>
          </div>

          {/* Post List */}
          <ol className="space-y-4">
            {series.posts.map(blueprintPost => {
              const isPublished = publishedSlugs.has(blueprintPost.targetSlug)
              const publishedPost = publishedPosts.find(p => p.slug === blueprintPost.targetSlug)

              return (
                <li key={blueprintPost.order} className="flex items-start gap-4">
                  {/* Number */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                    isPublished
                      ? 'bg-[#6B2C6B] text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {blueprintPost.order}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {isPublished ? (
                      <Link href={`/blog/${blueprintPost.targetSlug}`} className="group">
                        <p className="font-semibold text-gray-900 group-hover:text-[#6B2C6B] transition-colors">
                          {blueprintPost.topicTitle}
                        </p>
                        {publishedPost && (
                          <p className="text-sm text-gray-400 mt-0.5">
                            {new Date(publishedPost.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            {' · '}{publishedPost.readingTime}
                          </p>
                        )}
                      </Link>
                    ) : (
                      <div>
                        <p className="font-medium text-gray-400">{blueprintPost.topicTitle}</p>
                        <p className="text-sm text-gray-300 mt-0.5">Coming soon</p>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2026 Klinchapp. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/blog" className="text-[#6B2C6B] text-sm font-medium hover:underline">Blog</Link>
            <Link href="/terms" className="text-[#6B2C6B] text-sm font-medium hover:underline">Terms</Link>
            <Link href="/privacy" className="text-[#6B2C6B] text-sm font-medium hover:underline">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
