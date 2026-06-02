/**
 * Solid background colours used for the blog hero card on /blog/[slug],
 * the matching Next.js opengraph-image route, and the Recent Highlights
 * cards on /blog. Each post deterministically picks one variant from this
 * palette based on its slug — same slug always picks the same colour, so
 * the visual identity is stable across deploys but each post looks
 * distinct in a feed of posts.
 *
 * Palette is 20 colours:
 *   - 10 monochromatic purples (steps 1-10): brand purple ramp into
 *     near-black plum, white text reads cleanly on all.
 *   - 10 vibrant accents (steps 11-20): bright accent colours for visual
 *     energy on the cards. Some need DARK text rather than white (lighter
 *     hues like Cyan/Lime/Amber); see getHeroTextColor below.
 *
 * Adaptive text colour: because the vibrant subset spans bright and
 * saturated hues, callers must use getHeroTextColor() to pick between
 * light (white) and dark (slate-900) foreground text per background.
 */
export const BLOG_HERO_VARIANTS = [
  // Interleaved 2026-06-02 so adjacent indices alternate purple ↔ vibrant.
  // Result: in a row of cards (Recent Highlights carousel), consecutive
  // slugs almost never produce visually-similar adjacent colours.
  '#6B2C6B', '#22D3EE', // purple 1   / Electric Cyan
  '#612860', '#2DD4BF', // purple 2   / Aqua
  '#572454', '#34D399', // purple 3   / Emerald
  '#4D2050', '#A3E635', // purple 4   / Lime
  '#441C4A', '#DC2626', // purple 5   / Red
  '#3C1843', '#FB7185', // purple 6   / Coral
  '#34143B', '#F97316', // purple 7   / Orange
  '#2B1032', '#38BDF8', // purple 8   / Sky Blue
  '#220C29', '#818CF8', // purple 9   / Indigo
  '#190820', '#C084FC', // purple 10  / Lavender
] as const

/**
 * Pick a deterministic variant for a given post slug.
 *
 * Uses a djb2-style polynomial hash (h = h*31 + char) rather than a plain
 * character-code sum. The plain sum produces clustered results for similar-
 * looking slugs (e.g. everything starting with "ai-" lands on a narrow band
 * of indices). djb2 mixes each character into the running hash, giving a
 * much more uniform distribution across the 20-colour palette while
 * preserving the "same slug always picks the same colour" property.
 */
export function getHeroVariant(slug: string): string {
  let h = 0
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) | 0
  }
  return BLOG_HERO_VARIANTS[Math.abs(h) % BLOG_HERO_VARIANTS.length]
}

/**
 * Is this background colour from the purple ramp (first half of the palette)?
 * In the interleaved palette, purples live at EVEN indices (0, 2, 4, …, 18).
 * Used by the carousel to enforce the "no consecutive purples" constraint.
 */
export function isPurpleVariant(hex: string): boolean {
  const idx = (BLOG_HERO_VARIANTS as readonly string[]).indexOf(hex)
  return idx >= 0 && idx % 2 === 0
}

/**
 * Backgrounds where DARK text reads better than white text.
 * These are the lighter / brighter members of the vibrant subset.
 */
const DARK_TEXT_BACKGROUNDS = new Set<string>([
  '#22D3EE',
  '#2DD4BF',
  '#34D399',
  '#A3E635',
  '#FBBF24',
])

/**
 * Returns 'light' (white) or 'dark' (slate-900) — pick the foreground
 * text colour appropriate for the given background.
 *
 * Used by the blog post hero, the opengraph-image route, and the Recent
 * Highlights cards so the brand stays readable regardless of which
 * variant a post hashes into.
 *
 * Currently forced to ALWAYS return 'light' (white) for brand consistency.
 * Restore the adaptive logic (commented below) if the bright variants
 * prove genuinely unreadable in practice.
 */
export function getHeroTextColor(_bgHex: string): 'light' | 'dark' {
  return 'light'
  // Adaptive variant — return DARK_TEXT_BACKGROUNDS.has(_bgHex.toUpperCase()) ? 'dark' : 'light'
}
