import type { Metadata } from 'next'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllPosts, getPostBySlug, getPostsBySeries, getSeriesBySlug } from '@/lib/blog'
import { BLOG_PERSONA } from '@/lib/blog-persona'
import { notFound } from 'next/navigation'
import SocialSnippetsCard from './social-snippets'
import ShareButtons from './share-buttons'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  if (!post) return {}

  const url = `https://www.klinchapp.com/blog/${post.slug}`

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      images: [{ url: 'https://www.klinchapp.com/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const series = post.series ? getSeriesBySlug(post.series) : null
  const seriesPosts = post.series ? getPostsBySeries(post.series) : []
  const currentIndex = seriesPosts.findIndex(p => p.slug === post.slug)
  const prevPost = currentIndex > 0 ? seriesPosts[currentIndex - 1] : null
  const nextPost = currentIndex < seriesPosts.length - 1 ? seriesPosts[currentIndex + 1] : null

  // Related posts: same tags, different post, max 3
  const allPosts = getAllPosts()
  const relatedPosts = allPosts
    .filter(p => p.slug !== post.slug)
    .map(p => ({
      ...p,
      relevance: p.tags.filter(t => post.tags.includes(t)).length + (p.series === post.series ? 1 : 0),
    }))
    .filter(p => p.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { '@type': 'Person', name: post.author, url: 'https://www.klinchapp.com/blog' },
    publisher: { '@type': 'Organization', name: 'Klinchapp', url: 'https://www.klinchapp.com' },
    mainEntityOfPage: `https://www.klinchapp.com/blog/${post.slug}`,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFAFF] via-[#FDF2F8] to-[#FFF8F8]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          {/* Series badge */}
          {series && (
            <Link
              href={`/blog/series/${series.slug}`}
              className="inline-block px-3 py-1.5 bg-[#F3E8FF] text-[#6B2C6B] rounded-full text-sm font-medium mb-4 hover:bg-[#E9D5FF] transition-colors"
            >
              {series.title} · Part {post.seriesOrder} of {series.totalPosts}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b border-gray-100">
            <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>·</span>
            <span>{post.readingTime}</span>
            <span>·</span>
            <span>By {post.author}</span>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4 prose-p:text-gray-600 prose-p:mb-4 prose-a:text-[#6B2C6B] prose-a:font-medium prose-strong:text-gray-900 prose-li:text-gray-600 prose-blockquote:border-[#6B2C6B] prose-blockquote:text-gray-500">
            <MDXRemote source={post.content} />
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-100">
              {post.tags.map(tag => (
                <Link
                  key={tag}
                  href={`/blog?tag=${tag}`}
                  className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <ShareButtons title={post.title} slug={post.slug} />
          </div>
        </article>

        {/* Series Navigation */}
        {series && (prevPost || nextPost) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {prevPost ? (
              <Link href={`/blog/${prevPost.slug}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all">
                <span className="text-xs text-gray-400 uppercase font-medium">← Previous</span>
                <p className="text-sm font-semibold text-gray-900 mt-1">{prevPost.title}</p>
              </Link>
            ) : <div />}
            {nextPost && (
              <Link href={`/blog/${nextPost.slug}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all text-right">
                <span className="text-xs text-gray-400 uppercase font-medium">Next →</span>
                <p className="text-sm font-semibold text-gray-900 mt-1">{nextPost.title}</p>
              </Link>
            )}
          </div>
        )}

        {/* Social Snippets */}
        <SocialSnippetsCard social={post.social} postUrl={post.slug} />

        {/* Author Bio */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#F3E8FF] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[#6B2C6B] font-bold text-lg">{BLOG_PERSONA.name[0]}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{BLOG_PERSONA.name}</p>
              <p className="text-xs text-[#6B2C6B] font-medium mb-1">{BLOG_PERSONA.role}</p>
              <p className="text-sm text-gray-500">{BLOG_PERSONA.bio}</p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">You might also like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map(rp => (
                <Link key={rp.slug} href={`/blog/${rp.slug}`} className="group">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all h-full">
                    <p className="font-semibold text-gray-900 text-sm group-hover:text-[#6B2C6B] transition-colors mb-2">{rp.title}</p>
                    <p className="text-gray-400 text-xs line-clamp-2 mb-3">{rp.description}</p>
                    <span className="text-xs text-gray-300">{rp.readingTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Klinchapp" className="w-16 h-16 rounded-xl object-contain shadow-sm bg-white" />
            <span className="font-bold text-[#6B2C6B]">Klinchapp</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 Klinchapp. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/blog" className="text-[#6B2C6B] text-sm font-medium hover:underline">Blog</Link>
            <Link href="/contact" className="text-[#6B2C6B] text-sm font-medium hover:underline">Contact</Link>
            <Link href="/terms" className="text-[#6B2C6B] text-sm font-medium hover:underline">Terms</Link>
            <Link href="/privacy" className="text-[#6B2C6B] text-sm font-medium hover:underline">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
