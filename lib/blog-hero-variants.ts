/**
 * Solid background colours used for the blog hero card and the matching
 * Next.js opengraph-image route. Each post deterministically picks one
 * variant from this palette based on its slug — same slug always picks
 * the same colour, so the visual identity is stable across deploys but
 * each post looks distinct in a feed of posts.
 *
 * Palette: a monochromatic descending ramp from the Klinchapp brand
 * purple (`#6B2C6B`) down to a near-black plum. All readable with white
 * foreground text.
 */
export const BLOG_HERO_VARIANTS = [
  '#6B2C6B',
  '#612860',
  '#572454',
  '#4D2050',
  '#441C4A',
  '#3C1843',
  '#34143B',
  '#2B1032',
  '#220C29',
  '#190820',
] as const

/** Pick a deterministic variant for a given post slug. */
export function getHeroVariant(slug: string): string {
  let sum = 0
  for (let i = 0; i < slug.length; i++) sum += slug.charCodeAt(i)
  return BLOG_HERO_VARIANTS[sum % BLOG_HERO_VARIANTS.length]
}
