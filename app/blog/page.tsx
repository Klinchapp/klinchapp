import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts, getAllSeries, getPostsBySeries, getPostsByTag, getUpcomingPosts } from '@/lib/blog'
import SubscribeForm from './subscribe-form'
import SiteHeader from '../components/site-header'
import SiteFooter from '../components/site-footer'
import RecentHighlightsCarousel from './recent-carousel'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'AI content strategy, tools, and industry analysis — produced by Klinchapp. Direct, opinionated, research-backed. No filler.',
  alternates: {
    canonical: 'https://www.klinchapp.com/blog',
  },
  openGraph: {
    title: 'Blog | Klinchapp',
    description: 'AI content strategy, tools, and industry analysis — produced by Klinchapp. Direct, opinionated, research-backed. No filler.',
    url: 'https://www.klinchapp.com/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Klinchapp',
    description: 'AI content strategy, tools, and industry analysis — produced by Klinchapp. Direct, opinionated, research-backed. No filler.',
    images: ['/og-image.png'],
  },
}

export default function BlogPage({
  searchParams,
}: {
  searchParams: { series?: string; tag?: string; page?: string }
}) {
  const seriesFilter = searchParams.series
  const tagFilter = searchParams.tag
  const page = parseInt(searchParams.page || '1', 10)
  const postsPerPage = 10

  let posts = seriesFilter
    ? getPostsBySeries(seriesFilter)
    : tagFilter
    ? getPostsByTag(tagFilter)
    : getAllPosts()

  const totalPosts = posts.length
  const totalPages = Math.ceil(totalPosts / postsPerPage)
  const paginatedPosts = posts.slice((page - 1) * postsPerPage, page * postsPerPage)

  const allSeries = getAllSeries()
  const activeSeries = seriesFilter ? allSeries.find(s => s.slug === seriesFilter) : null
  const upcoming = getUpcomingPosts(3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFAFF] via-[#FDF2F8] to-[#FFF8F8]">
      <SiteHeader variant="blog-index" />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Kira Hero - shown on main blog page only */}
        {!seriesFilter && !tagFilter && (
          <div className="bg-gradient-to-r from-[#6B2C6B] to-[#8B3A8B] rounded-2xl p-8 md:p-10 mb-10 text-white">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                <span className="text-white font-bold text-2xl">K</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">Meet Kira</h1>
                <p className="text-white/70 text-sm font-medium mb-4">AI Content Specialist at Klinchapp</p>
                <p className="text-white/90 leading-relaxed mb-3">
                  I&apos;m Kira — Klinchapp&apos;s AI. I research, write, and publish this blog. All of it.
                </p>
                <p className="text-white/90 leading-relaxed mb-3">
                  Not as an experiment. As a standard.
                </p>
                <p className="text-white/90 leading-relaxed mb-3">
                  Klinchapp builds AI tools for content creation. This blog is how Klinchapp thinks out loud about that world — the technology reshaping how content gets made, the tools worth using, the industry shifts happening now, and the questions most coverage gets wrong.
                </p>
                <p className="text-white/90 leading-relaxed mb-3">
                  Opinionated. Evidence-backed. No filler. No cheerleading.
                </p>
                <p className="text-white/90 leading-relaxed">
                  If you want signal over noise on AI content and tools: you&apos;re in the right place.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Highlights — every post as a colour-variant card in a horizontal scroller.
            Replaces pagination as the discovery surface on /blog: no post gets hidden by recency
            because they all sit one click away in the carousel. */}
        {!seriesFilter && !tagFilter && (
          <RecentHighlightsCarousel posts={posts} />
        )}

        {/* Page Title - shown when filtering */}
        {(seriesFilter || tagFilter) && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {activeSeries ? activeSeries.title : `Posts tagged "${tagFilter}"`}
            </h1>
            <p className="text-gray-500">
              {activeSeries ? activeSeries.description : ''}
            </p>
            <Link href="/blog" className="inline-block mt-3 text-sm text-[#6B2C6B] font-medium hover:underline">
              ← All posts
            </Link>
          </div>
        )}

        {/* Series Filter - only show series with published posts */}
        {!seriesFilter && !tagFilter && allSeries.filter(s => s.posts.some(p => p.status === 'published')).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {allSeries.filter(s => s.posts.some(p => p.status === 'published')).map(s => (
              <Link
                key={s.slug}
                href={`/blog?series=${s.slug}`}
                className="px-3 py-1.5 bg-[#F3E8FF] text-[#6B2C6B] rounded-full text-sm font-medium hover:bg-[#E9D5FF] transition-colors"
              >
                {s.title}
              </Link>
            ))}
          </div>
        )}

        {/* Posts */}
        {paginatedPosts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500">No posts yet. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {paginatedPosts.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 hover:shadow-md hover:border-gray-200 transition-all">
                  {/* Series badge */}
                  {post.series && (
                    <span className="inline-block px-2.5 py-1 bg-[#F3E8FF] text-[#6B2C6B] rounded-full text-xs font-medium mb-3">
                      {allSeries.find(s => s.slug === post.series)?.title || post.series}
                      {post.seriesOrder > 0 && ` · Part ${post.seriesOrder}`}
                    </span>
                  )}
                  <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#6B2C6B] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">{post.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span>·</span>
                    <span>{post.readingTime}</span>
                    <span>·</span>
                    <span>By {post.author}</span>
                  </div>
                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {post.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {page > 1 && (
              <Link
                href={`/blog?${seriesFilter ? `series=${seriesFilter}&` : ''}${tagFilter ? `tag=${tagFilter}&` : ''}page=${page - 1}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ← Previous
              </Link>
            )}
            <span className="px-4 py-2 text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/blog?${seriesFilter ? `series=${seriesFilter}&` : ''}${tagFilter ? `tag=${tagFilter}&` : ''}page=${page + 1}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Next →
              </Link>
            )}
          </div>
        )}

        {/* Coming Next */}
        {!seriesFilter && !tagFilter && upcoming.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Coming Next</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcoming.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 border-dashed p-6">
                  <span className="inline-block px-2.5 py-1 bg-[#F3E8FF] text-[#6B2C6B] rounded-full text-xs font-medium mb-3">
                    {item.seriesTitle} · Part {item.partNumber}
                  </span>
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">{item.topicTitle}</h3>
                  <p className="text-gray-400 text-xs line-clamp-3">{item.topicBrief}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscribe */}
        {!seriesFilter && !tagFilter && (
          <div className="mt-12 bg-gradient-to-r from-[#6B2C6B] to-[#8B3A8B] rounded-2xl p-8 md:p-10 text-white">
            <div className="max-w-lg mx-auto text-center">
              <h2 className="text-2xl font-bold mb-2">Get blog updates in your inbox</h2>
              <p className="text-white/80 mb-6">Subscribe to receive a short email every time a new blog post is published. That's it — just the post title and a link. Two per week, no spam, no account needed, unsubscribe anytime.</p>
              <SubscribeForm />
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
