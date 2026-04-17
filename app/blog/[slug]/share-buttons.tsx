'use client'

import { useState, useEffect } from 'react'

export default function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)

  const postUrl = `https://www.klinchapp.com/blog/${slug}`

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share)
  }, [])

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(postUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, url: postUrl })
    } catch {}
  }

  return (
    <div>
      <span className="text-xs text-gray-400 uppercase font-medium block mb-3">Share this post</span>
      <div className="flex flex-wrap gap-2">
        {/* Copy Link - primary action */}
        <button
          onClick={handleCopyLink}
          className="px-4 py-2 bg-[#6B2C6B] text-white rounded-lg text-sm font-medium hover:bg-[#8B3A8B] transition-colors"
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>

        {/* Native Share - mobile */}
        {canNativeShare && (
          <button
            onClick={handleNativeShare}
            className="px-4 py-2 bg-[#6B2C6B] text-white rounded-lg text-sm font-medium hover:bg-[#8B3A8B] transition-colors"
          >
            Share...
          </button>
        )}

        {/* X / Twitter */}
        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          X
        </a>

        {/* LinkedIn */}
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          LinkedIn
        </a>
      </div>
    </div>
  )
}
