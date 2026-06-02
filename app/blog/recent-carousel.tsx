'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { type BlogPost } from '@/lib/blog'
import { BLOG_HERO_VARIANTS, getHeroVariant, getHeroTextColor, isPurpleVariant } from '@/lib/blog-hero-variants'

/**
 * Punchy hook used as the lead content on Recent Highlights cards.
 * Fallback chain: post.hook → post.social.twitter → post.description.
 * Hashtags are stripped at render so the card reads as editorial copy.
 */
function getCardSnippet(post: BlogPost): string {
  const raw = post.hook || post.social?.twitter || post.description || ''
  return raw
    .replace(/#\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Horizontally-scrolling row of every published post as a color-variant card.
 * Arrow buttons scroll programmatically; native swipe handles mobile. Cards
 * snap into place as you scroll. Replaces the need for pagination on /blog —
 * every post is now one click away from the index, no matter how old.
 */
export default function RecentHighlightsCarousel({ posts }: { posts: BlogPost[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = scrollerRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [updateScrollState])

  const scrollByPage = (direction: 'left' | 'right') => {
    const el = scrollerRef.current
    if (!el) return
    const amount = el.clientWidth * 0.8 * (direction === 'right' ? 1 : -1)
    el.scrollBy({ left: amount, behavior: 'smooth' })
  }

  if (posts.length === 0) return null

  // Pre-compute card colours with adjacency constraints:
  //   1. No two consecutive cards share the exact same colour.
  //   2. No two consecutive cards are both from the purple ramp.
  // We start from each post's slug-hash colour (so colours stay mostly stable
  // across deploys) and only shift a card if it would violate the rules.
  // Falls forward through the palette until a non-violating colour is found.
  const cardColors: string[] = []
  for (let i = 0; i < posts.length; i++) {
    let color = getHeroVariant(posts[i].slug)
    if (i > 0) {
      const prev = cardColors[i - 1]
      const prevIsPurple = isPurpleVariant(prev)
      let attempts = 0
      while (
        attempts < BLOG_HERO_VARIANTS.length &&
        (color === prev || (prevIsPurple && isPurpleVariant(color)))
      ) {
        const nextIdx = ((BLOG_HERO_VARIANTS as readonly string[]).indexOf(color) + 1) % BLOG_HERO_VARIANTS.length
        color = BLOG_HERO_VARIANTS[nextIdx]
        attempts++
      }
    }
    cardColors.push(color)
  }

  return (
    <section className="mb-12">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">The Kira archive</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollByPage('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollByPage('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]"
      >
        {posts.map((post, i) => {
          const bg = cardColors[i]
          const isDarkText = getHeroTextColor(bg) === 'dark'
          const textClass = isDarkText ? 'text-slate-900' : 'text-white'
          const mutedClass = isDarkText ? 'text-slate-900/70' : 'text-white/80'
          return (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={`group rounded-2xl shadow-sm p-4 md:p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 flex flex-col min-h-[240px] flex-shrink-0 snap-start w-[180px] md:w-[200px] ${textClass}`}
              style={{ background: bg }}
            >
              {/* Hook as the lead — no title, no chip */}
              <p className="text-xs leading-snug">
                {getCardSnippet(post)}
              </p>
              {/* Date and Read more → sit together at the bottom */}
              <span className={`text-[9px] mt-auto whitespace-nowrap ${mutedClass}`}>
                {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
              <span className={`text-[11px] font-semibold whitespace-nowrap mt-1 ${textClass}`}>
                Read more →
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
