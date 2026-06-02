import { ImageResponse } from 'next/og'
import { getAllPosts, getPostBySlug, getSeriesBySlug } from '@/lib/blog'
import { BLOG_HERO_VARIANTS, getHeroVariant, getHeroTextColor } from '@/lib/blog-hero-variants'

export const alt = 'Klinchapp blog post'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export default async function Image({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)

  // Fallback if the slug isn't a known post — minimal Klinchapp card.
  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: BLOG_HERO_VARIANTS[0],
            color: 'white',
            fontSize: '96px',
            fontWeight: 800,
            fontFamily: 'sans-serif',
            letterSpacing: '-0.02em',
          }}
        >
          Klinchapp
        </div>
      ),
      { ...size },
    )
  }

  const series = post.series ? getSeriesBySlug(post.series) : null
  const background = getHeroVariant(post.slug)
  const isDarkText = getHeroTextColor(background) === 'dark'
  const fg = isDarkText ? '#0F172A' : '#FFFFFF'
  const chipBg = isDarkText ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.18)'

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          background,
          padding: '72px',
          color: fg,
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top — series tag */}
        <div style={{ display: 'flex' }}>
          {series ? (
            <div
              style={{
                display: 'flex',
                padding: '12px 28px',
                background: chipBg,
                borderRadius: '999px',
                fontSize: '26px',
                fontWeight: 500,
              }}
            >
              {series.title} · Part {post.seriesOrder} of {series.totalPosts}
            </div>
          ) : (
            <div style={{ display: 'flex' }} />
          )}
        </div>

        {/* Middle — post title */}
        <div
          style={{
            display: 'flex',
            fontSize: '64px',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            maxWidth: '1056px',
          }}
        >
          {post.title}
        </div>

        {/* Bottom — brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: '44px', fontWeight: 800, letterSpacing: '-0.02em' }}>Klinchapp</div>
          <div style={{ display: 'flex', fontSize: '24px', opacity: isDarkText ? 0.7 : 0.85 }}>by Kira</div>
        </div>
      </div>
    ),
    { ...size },
  )
}
