'use client'

import { useState } from 'react'
import type { SocialSnippets } from '@/lib/blog'

const platforms = [
  { key: 'twitter' as const, label: 'X / Twitter', icon: 'X' },
  { key: 'linkedin' as const, label: 'LinkedIn', icon: 'in' },
  { key: 'instagram' as const, label: 'Instagram', icon: 'IG' },
  { key: 'facebook' as const, label: 'Facebook', icon: 'f' },
  { key: 'tiktok' as const, label: 'TikTok', icon: 'TT' },
]

export default function SocialSnippetsCard({ social, postUrl }: { social: SocialSnippets; postUrl: string }) {
  const [active, setActive] = useState<keyof SocialSnippets>('twitter')
  const [copied, setCopied] = useState(false)

  const available = platforms.filter(p => social[p.key]?.trim())
  if (available.length === 0) return null

  const fullUrl = `https://www.klinchapp.com/blog/${postUrl}`

  const getSnippetWithUrl = () => {
    const text = social[active]
    // Instagram doesn't support clickable links in posts
    if (active === 'instagram') return text
    return `${text}\n\n${fullUrl}`
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getSnippetWithUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-400 uppercase font-medium">Share this post</span>
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 bg-[#F3E8FF] text-[#6B2C6B] rounded-lg text-xs font-medium hover:bg-[#E9D5FF] transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Platform tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {available.map(p => (
          <button
            key={p.key}
            onClick={() => { setActive(p.key); setCopied(false) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              active === p.key
                ? 'bg-[#6B2C6B] text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Snippet content */}
      <p className="text-gray-700 text-sm whitespace-pre-wrap">{social[active]}</p>
      {active !== 'instagram' && (
        <p className="text-[#6B2C6B] text-sm mt-2 font-medium">{fullUrl}</p>
      )}
    </div>
  )
}
