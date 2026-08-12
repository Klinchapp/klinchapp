import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

// --- Types ---

export interface SocialSnippets {
  twitter: string
  linkedin: string
  instagram: string
  facebook: string
  tiktok: string
}

export interface BlogPost {
  slug: string
  title: string
  description: string
  publishedAt: string
  series: string
  seriesOrder: number
  tags: string[]
  author: string
  social: SocialSnippets
  /**
   * Optional punchy editorial hook used as the lead text on Recent Highlights
   * cards (`/blog`). Distinct from social.twitter — that one is formal and
   * shareable; this one is Klinchapp's own punchy marketing copy.
   * Falls back to social.twitter, then description, if not set.
   */
  hook?: string
  qualityScore: number
  status: string
  readingTime: string
  content: string
}

export interface SeriesBlueprintPost {
  order: number
  topicTitle: string
  topicBrief: string
  targetSlug: string
  status: 'pending' | 'published' | 'skipped' | 'rejected'
}

export interface SeriesBlueprint {
  slug: string
  title: string
  description: string
  totalPosts: number
  tags: string[]
  posts: SeriesBlueprintPost[]
}

// --- Paths ---

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')
const SERIES_DIR = path.join(process.cwd(), 'content', 'series')

// --- Blog Post Functions ---

function parseMdxFile(filePath: string): BlogPost | null {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const stats = readingTime(content)

  if (data.status !== 'published') return null

  const publishDate = new Date(data.publishedAt)
  if (publishDate > new Date()) return null

  return {
    slug: data.slug,
    title: data.title,
    description: data.description || '',
    publishedAt: data.publishedAt,
    series: data.series || '',
    seriesOrder: data.seriesOrder || 0,
    tags: data.tags || [],
    author: data.author || 'Kira',
    social: data.social || { twitter: data.tweet || '', linkedin: '', instagram: '', facebook: '', tiktok: '' },
    hook: data.hook || undefined,
    qualityScore: data.qualityScore || 0,
    status: data.status,
    readingTime: stats.text,
    content,
  }
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return []

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx'))
  const posts = files
    .map(f => parseMdxFile(path.join(BLOG_DIR, f)))
    .filter((p): p is BlogPost => p !== null)

  return posts.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const stats = readingTime(content)

  return {
    slug: data.slug || slug,
    title: data.title,
    description: data.description || '',
    publishedAt: data.publishedAt,
    series: data.series || '',
    seriesOrder: data.seriesOrder || 0,
    tags: data.tags || [],
    author: data.author || 'Kira',
    social: data.social || { twitter: data.tweet || '', linkedin: '', instagram: '', facebook: '', tiktok: '' },
    hook: data.hook || undefined,
    qualityScore: data.qualityScore || 0,
    status: data.status || 'published',
    readingTime: stats.text,
    content,
  }
}

export function getPostsBySeries(seriesSlug: string): BlogPost[] {
  return getAllPosts()
    .filter(p => p.series === seriesSlug)
    .sort((a, b) => a.seriesOrder - b.seriesOrder)
}

export function getAllTags(): string[] {
  const tags = new Set<string>()
  getAllPosts().forEach(p => p.tags.forEach(t => tags.add(t)))
  return Array.from(tags).sort()
}

export function getPostsByTag(tag: string): BlogPost[] {
  return getAllPosts().filter(p => p.tags.includes(tag))
}

// --- Series Functions ---

export function getAllSeries(): SeriesBlueprint[] {
  if (!fs.existsSync(SERIES_DIR)) return []

  const files = fs.readdirSync(SERIES_DIR).filter(f => f.endsWith('.json'))
  return files.map(f => {
    const raw = fs.readFileSync(path.join(SERIES_DIR, f), 'utf-8')
    return JSON.parse(raw) as SeriesBlueprint
  })
}

export function getSeriesBySlug(slug: string): SeriesBlueprint | null {
  const filePath = path.join(SERIES_DIR, `${slug}.json`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as SeriesBlueprint
}

export interface UpcomingPost {
  topicTitle: string
  topicBrief: string
  seriesTitle: string
  seriesSlug: string
  partNumber: number
  totalParts: number
}

export function getUpcomingPosts(limit: number = 3): UpcomingPost[] {
  const allSeriesList = getAllSeries()
  const upcoming: UpcomingPost[] = []

  for (const series of allSeriesList) {
    for (const post of series.posts) {
      if (post.status === 'pending') {
        upcoming.push({
          topicTitle: post.topicTitle,
          topicBrief: post.topicBrief,
          seriesTitle: series.title,
          seriesSlug: series.slug,
          partNumber: post.order,
          totalParts: series.totalPosts,
        })
        break // only the next pending post per series
      }
    }
  }

  return upcoming.slice(0, limit)
}
