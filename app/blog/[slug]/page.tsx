import type { Metadata } from 'next'
import type { AnchorHTMLAttributes } from 'react'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'

// MDX rendering options. remark-gfm enables GitHub-flavored markdown:
// tables, strikethrough, task lists, autolinks. Without it, markdown
// tables silently render as raw pipes — which broke 2+ existing posts.
const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
  },
}

// Custom MDX components — anchor smart-target rule:
//   - Internal links (start with "/" or "#") → same tab (default navigation flow)
//   - External links (anything else, typically http(s)://) → new tab + rel="noopener noreferrer"
// Applied to every blog post automatically via the components prop on MDXRemote.
// Existing posts and future Kira-generated posts both inherit this behaviour at render.
const mdxComponents = {
  a: ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isInternal = !!href && (href.startsWith('/') || href.startsWith('#'))
    if (isInternal) {
      return <a href={href} {...rest}>{children}</a>
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    )
  },
}
import { getAllPosts, getPostBySlug, getPostsBySeries, getSeriesBySlug } from '@/lib/blog'
import { BLOG_PERSONA } from '@/lib/blog-persona'
import { getHeroVariant, getHeroTextColor } from '@/lib/blog-hero-variants'
import { detectFAQ, detectHowTo } from '@/lib/blog-schema-detection'
import { notFound } from 'next/navigation'
import SocialSnippetsCard from './social-snippets'
import ShareButtons from './share-buttons'
import SiteHeader from '../../components/site-header'
import SiteFooter from '../../components/site-footer'

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
      // og:image is auto-wired by the sibling opengraph-image.tsx route — unique per slug.
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
    url: `https://www.klinchapp.com/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    inLanguage: 'en',
    image: {
      '@type': 'ImageObject',
      url: `https://www.klinchapp.com/blog/${post.slug}/opengraph-image`,
      width: 1200,
      height: 630,
    },
    author: {
      '@type': 'Organization',
      name: 'Klinchapp',
      url: 'https://www.klinchapp.com',
    },
    publisher: { '@id': 'https://www.klinchapp.com/#organization' },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.klinchapp.com/blog/${post.slug}`,
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Klinchapp', item: 'https://www.klinchapp.com/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.klinchapp.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://www.klinchapp.com/blog/${post.slug}` },
    ],
  }

  // Detect FAQ and HowTo blocks Kira may have written, emit matching schema.
  // Detection is conservative — when nothing qualifies, no extra schema is emitted.
  const faq = detectFAQ(post.content)
  const faqJsonLd = faq && {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }

  const howTo = detectHowTo(post.content)
  const howToJsonLd = howTo && {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howTo.name,
    step: howTo.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFAFF] via-[#FDF2F8] to-[#FFF8F8]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
      {howToJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      )}

      <SiteHeader variant="back-blog" />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero — same visual identity as the sibling opengraph-image route. Carries the H1. */}
        {/* Background is a per-slug solid colour from BLOG_HERO_VARIANTS (Tailwind can't generate dynamic arbitrary values, so inline). */}
        {/* Text colour adapts to the background brightness — some vibrant variants need dark text. */}
        {(() => {
          const heroBg = getHeroVariant(post.slug)
          const isDarkText = getHeroTextColor(heroBg) === 'dark'
          const textClass = isDarkText ? 'text-slate-900' : 'text-white'
          const chipClass = isDarkText
            ? 'bg-slate-900/15 hover:bg-slate-900/25'
            : 'bg-white/20 hover:bg-white/30'
          const opacityClass = isDarkText ? 'opacity-70' : 'opacity-85'
          return (
        <div
          className={`aspect-[1200/630] rounded-2xl shadow-sm mb-6 p-6 md:p-10 lg:p-12 flex flex-col justify-between ${textClass}`}
          style={{ background: heroBg }}
        >
          <div>
            {series && (
              <Link
                href={`/blog/series/${series.slug}`}
                className={`inline-block px-3 md:px-4 py-1 md:py-1.5 ${chipClass} rounded-full text-xs md:text-sm font-medium transition-colors`}
              >
                {series.title} · Part {post.seriesOrder} of {series.totalPosts}
              </Link>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
            {post.title}
          </h1>
          <div className="flex items-end justify-between">
            <div className="text-lg md:text-2xl font-extrabold tracking-tight">Klinchapp</div>
            <div className={`text-xs md:text-base ${opacityClass}`}>by Kira</div>
          </div>
        </div>
          )
        })()}

        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b border-gray-100">
            <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>·</span>
            <span>{post.readingTime}</span>
            <span>·</span>
            <span>By {post.author}</span>
          </div>

          {/* Content */}
          <div className="blog-content prose prose-gray max-w-none prose-headings:text-gray-900 prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4 prose-p:text-gray-600 prose-p:mb-4 prose-a:text-[#6B2C6B] prose-a:font-medium prose-strong:text-gray-900 prose-li:text-gray-600 prose-blockquote:border-[#6B2C6B] prose-blockquote:text-gray-500">
            <MDXRemote source={post.content} components={mdxComponents} options={mdxOptions} />
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

      <SiteFooter />
    </div>
  )
}
