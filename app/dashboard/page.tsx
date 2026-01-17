'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

// Monoline SVG Icons
const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CogIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const LogOutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
)

const CameraIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-8 h-8 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>
)

const PencilIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-8 h-8 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
)

const UploadIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-10 h-10 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
)

const WandIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
)

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const CheckIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)

const CopyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
)

const RefreshIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
)

const ShieldCheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
)

const LoaderIcon = ({ className = "w-5 h-5" }) => (
  <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)

const AlertIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
)

const GlobeIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
)

// Platform Icons
const TwitterIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4l6.5 7.5M20 4l-6.5 7.5m0 0L20 20M13.5 11.5L4 20" /></svg>)
const InstagramIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="4" strokeLinecap="round" strokeLinejoin="round" /><circle cx="18" cy="6" r="1" fill="currentColor" /></svg>)
const LinkedInIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 10v7M7 7v.01M11 17v-4a2 2 0 014 0v4M11 10v7" /></svg>)
const FacebookIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" /></svg>)
const TikTokIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12a4 4 0 104 4V4a5 5 0 005 5" /></svg>)

// Language configuration with ISO 639-1 codes
const languageConfig: Record<string, { name: string; code: string; rtl: boolean }> = {
  english: { name: 'English', code: 'EN', rtl: false },
  spanish: { name: 'Español', code: 'ES', rtl: false },
  portuguese: { name: 'Português', code: 'PT', rtl: false },
  french: { name: 'Français', code: 'FR', rtl: false },
  arabic: { name: 'العربية', code: 'AR', rtl: true },
  hindi: { name: 'हिन्दी', code: 'HI', rtl: false }
}

// Platform configuration
const platformConfig: Record<string, { name: string; icon: React.ReactNode; charLimit: number; color: string }> = {
  twitter: { name: 'Twitter/X', icon: <TwitterIcon />, charLimit: 280, color: 'bg-[#6B2C6B]' },
  instagram: { name: 'Instagram', icon: <InstagramIcon />, charLimit: 2200, color: 'bg-gradient-to-r from-[#6B2C6B] to-[#8B3A8B]' },
  linkedin: { name: 'LinkedIn', icon: <LinkedInIcon />, charLimit: 3000, color: 'bg-[#6B2C6B]' },
  facebook: { name: 'Facebook', icon: <FacebookIcon />, charLimit: 63206, color: 'bg-[#6B2C6B]' },
  tiktok: { name: 'TikTok', icon: <TikTokIcon />, charLimit: 2200, color: 'bg-[#6B2C6B]' }
}

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [postType, setPostType] = useState<'product' | 'text'>('product')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [platform, setPlatform] = useState('instagram')
  const [originalPlatform, setOriginalPlatform] = useState('instagram')
  const [mood, setMood] = useState('professional')
  const [language, setLanguage] = useState('english')
  const [generatedLanguage, setGeneratedLanguage] = useState<string | null>(null)
  const [category, setCategory] = useState('')
  const [brandName, setBrandName] = useState('')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [textPrompt, setTextPrompt] = useState('')
  const [bookTitle, setBookTitle] = useState('')
  const [bookAuthor, setBookAuthor] = useState('')
  const [imageCheckStatus, setImageCheckStatus] = useState<'idle' | 'checking' | 'passed' | 'failed'>('idle')
  const [rejectionMessage, setRejectionMessage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [error, setError] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [remainingPosts, setRemainingPosts] = useState<number | null>(null)
  const [postHistory, setPostHistory] = useState<any[]>([])
  const [showPlatformWarning, setShowPlatformWarning] = useState(false)

  const features: Record<string, string[]> = {
    footwear: ['Comfort', 'Style', 'Durability', 'Breathability', 'Lightweight', 'Versatility'],
    books: ['Genre', 'Writing Style', 'Plot', 'Characters', 'Educational', 'Emotional Impact'],
    apparel: ['Fabric', 'Fit', 'Style', 'Breathability', 'Durability', 'Versatility'],
    electronics: ['Performance', 'Battery', 'Display', 'Build', 'Interface', 'Value'],
    food: ['Taste', 'Freshness', 'Nutrition', 'Presentation', 'Portion', 'Health'],
    beauty: ['Skin Benefits', 'Natural', 'Long-Lasting', 'Gentle', 'Results', 'Cruelty-Free'],
    general: ['Quality', 'Value', 'Innovation', 'Reliability', 'Design', 'Performance'],
    announcement: ['News', 'Update', 'Launch', 'Milestone', 'Behind Scenes', 'Team'],
    promotion: ['Limited Time', 'Special Offer', 'Discount', 'Free Shipping', 'Bundle', 'Flash Sale'],
    engagement: ['Question', 'Poll', 'Tips', 'How-To', 'Fun Fact', 'Inspiration']
  }

  const textCategories = [
    { value: 'announcement', label: 'Announcement' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'general', label: 'General' }
  ]

  useEffect(() => { checkUser() }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUser(user)
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(profile)
    const postsLimit = profile?.posts_limit || 60
    const postsUsed = profile?.posts_this_month || 0
    setRemainingPosts(postsLimit - postsUsed)
    const { data: posts } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
    if (posts) setPostHistory(posts)
    setLoading(false)
  }

  const signOut = async () => { await supabase.auth.signOut(); router.push('/') }

  const handlePostTypeChange = (newType: 'product' | 'text') => {
    setImagePreview(null); setImageCheckStatus('idle'); setRejectionMessage(''); setCategory(''); setBrandName('')
    setSelectedFeatures([]); setTextPrompt(''); setBookTitle(''); setBookAuthor(''); setGeneratedContent('')
    setGeneratedLanguage(null); setError(''); setPostType(newType); setShowPlatformWarning(false)
  }

  const compressImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width, height = img.height
        const maxDim = 800
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = (height / width) * maxDim; width = maxDim }
          else { width = (width / height) * maxDim; height = maxDim }
        }
        canvas.width = width; canvas.height = height
        canvas.getContext('2d')?.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = dataUrl
    })
  }

  const checkImageSafety = async (base64Image: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/check-image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64: base64Image }) })
      const data = await response.json()
      return data.safe === true
    } catch { return true }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setImageCheckStatus('checking'); setRejectionMessage(''); setImagePreview(null)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const result = event.target?.result as string
      const compressed = await compressImage(result)
      const base64 = compressed.split(',')[1]
      const isSafe = await checkImageSafety(base64)
      if (!isSafe) { setImageCheckStatus('failed'); setRejectionMessage('This image may contain inappropriate content. Please select a different image.'); setImagePreview(null); return }
      setImagePreview(compressed); setImageCheckStatus('passed')
    }
    reader.readAsDataURL(file)
  }

  const toggleFeature = (feature: string) => { setSelectedFeatures(prev => prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]) }
  const handleCategoryChange = (newCategory: string) => { setCategory(newCategory); setSelectedFeatures([]); if (newCategory !== 'books') { setBookTitle(''); setBookAuthor('') } }
  const handlePlatformChange = (newPlatform: string) => { if (generatedContent && newPlatform !== originalPlatform) { setShowPlatformWarning(true) } setPlatform(newPlatform) }

  const handleGenerate = async () => {
    setError(''); setIsGenerating(true); setShowPlatformWarning(false)
    try {
      const charLimit = platformConfig[platform].charLimit
      const body: any = { postType, platform, mood, language, features: selectedFeatures, charLimit }
      if (postType === 'product') {
        if (!imagePreview || imageCheckStatus !== 'passed') { setError('Please upload a valid image'); setIsGenerating(false); return }
        body.category = category; body.brandName = brandName; body.imageBase64 = imagePreview.split(',')[1]
        if (category === 'books') { body.bookTitle = bookTitle; body.bookAuthor = bookAuthor }
      } else {
        if (!textPrompt.trim()) { setError('Please describe what you want to post about'); setIsGenerating(false); return }
        body.textPrompt = textPrompt; body.category = category
      }
      const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await response.json()
      if (!response.ok) { setError(data.message || 'Failed to generate'); setIsGenerating(false); return }
      setGeneratedContent(data.content); setGeneratedLanguage(language); setRemainingPosts(data.remainingPosts); setOriginalPlatform(platform)
      const { data: updatedProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (updatedProfile) { setProfile(updatedProfile); setRemainingPosts((updatedProfile.posts_limit || 60) - (updatedProfile.posts_this_month || 0)) }
      const { data: posts } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
      if (posts) setPostHistory(posts)
    } catch (err: any) { setError(err.message || 'Something went wrong') } finally { setIsGenerating(false) }
  }

  const handleCopy = async () => { await navigator.clipboard.writeText(generatedContent); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000) }

  const handleShare = async (shareType: string) => {
    if (shareType === 'twitter') { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(generatedContent)}`, '_blank', 'width=550,height=420') }
    else if (shareType === 'facebook') { window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(generatedContent)}`, '_blank', 'width=550,height=420') }
    else if (shareType === 'linkedin') { window.open(`https://www.linkedin.com/shareArticle?mini=true&summary=${encodeURIComponent(generatedContent)}`, '_blank', 'width=550,height=420') }
    else if (shareType === 'instagram' || shareType === 'tiktok') {
      await navigator.clipboard.writeText(generatedContent); setCopySuccess(true)
      setTimeout(() => { setCopySuccess(false); window.open(shareType === 'instagram' ? 'https://www.instagram.com/' : 'https://www.tiktok.com/', '_blank') }, 1500)
    }
  }

  const charCount = generatedContent.length
  const charLimit = platformConfig[platform]?.charLimit || 2200
  const charPercentage = (charCount / charLimit) * 100
  const isOverLimit = charCount > charLimit
  const isNearLimit = charPercentage > 80 && !isOverLimit
  const isGeneratedRTL = generatedLanguage ? (languageConfig[generatedLanguage]?.rtl || false) : false
  const isNonEnglishGenerated = generatedLanguage && generatedLanguage !== 'english'

  if (loading) { return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDFAFF] to-[#FDF2F8]"><LoaderIcon className="w-8 h-8 text-[#6B2C6B]" /></div>) }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFAFF] via-[#FDF2F8] to-[#FFF8F8] flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Klinchapp" className="w-12 h-12 rounded-xl object-contain shadow-sm bg-white" />
            <span className="text-xl font-extrabold text-[#6B2C6B]">Klinchapp</span>
          </div>
          <div className="flex items-center gap-3">
            {remainingPosts !== null && (<div className="px-4 py-2 bg-[#F3E8FF] rounded-full text-sm font-semibold text-[#6B2C6B]">{remainingPosts}/60 posts left</div>)}
            <button onClick={() => setShowHistory(!showHistory)} className={`p-2.5 rounded-lg transition-all ${showHistory ? 'bg-[#6B2C6B] text-white' : 'text-gray-600 hover:bg-gray-100'}`} title="History"><ClockIcon /></button>
            <button onClick={() => setShowSettings(!showSettings)} className={`p-2.5 rounded-lg transition-all ${showSettings ? 'bg-[#6B2C6B] text-white' : 'text-gray-600 hover:bg-gray-100'}`} title="Settings"><CogIcon /></button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <img src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}&background=6B2C6B&color=fff`} alt="Profile" className="w-8 h-8 rounded-full" />
              <button onClick={signOut} className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-all" title="Sign Out"><LogOutIcon /></button>
            </div>
          </div>
        </div>
      </header>

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 border-l border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#6B2C6B] flex items-center gap-2"><ClockIcon /> History</h3>
            <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 rounded-lg"><XIcon /></button>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100%-80px)]">
            {postHistory.length === 0 ? (<p className="text-gray-500 text-center py-8">No posts yet</p>) : (
              postHistory.map((post, idx) => (
                <div key={idx} className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2"><span className="text-xs font-semibold text-[#6B2C6B] capitalize">{post.platform}</span><span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</span></div>
                  <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Settings Sidebar */}
      {showSettings && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 border-l border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#6B2C6B] flex items-center gap-2"><CogIcon /> Settings</h3>
            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 rounded-lg"><XIcon /></button>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-2"><strong>Email:</strong> {user?.email}</p>
            <p className="text-gray-600 mb-4"><strong>Posts this month:</strong> {profile?.posts_this_month || 0} / 60</p>
            <button onClick={signOut} className="w-full px-4 py-2 bg-[#6B2C6B] text-white rounded-lg hover:bg-[#8B3A8B] transition-colors">Sign Out</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Post Type Selector */}
        <div className="mb-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-[#6B2C6B] mb-4">What would you like to create?</p>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handlePostTypeChange('product')} className={`p-6 rounded-xl border-2 text-left transition-all ${postType === 'product' ? 'border-[#6B2C6B] bg-[#F3E8FF]' : 'border-gray-200 hover:border-gray-300'}`}>
              <CameraIcon className="w-8 h-8 text-[#6B2C6B] mb-3" /><p className="font-bold text-gray-800">Product Post</p><p className="text-sm text-gray-500">Upload an image</p>
            </button>
            <button onClick={() => handlePostTypeChange('text')} className={`p-6 rounded-xl border-2 text-left transition-all ${postType === 'text' ? 'border-[#6B2C6B] bg-[#F3E8FF]' : 'border-gray-200 hover:border-gray-300'}`}>
              <PencilIcon className="w-8 h-8 text-[#6B2C6B] mb-3" /><p className="font-bold text-gray-800">Text Post</p><p className="text-sm text-gray-500">Describe your content</p>
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Input Panel */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[550px]">
            <div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">{postType === 'product' ? <><CameraIcon className="w-5 h-5" /> Product Details</> : <><PencilIcon className="w-5 h-5" /> Text Details</>}</h3>
              {postType === 'product' ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Image <span className="text-[#6B2C6B]">*</span></label>
                    <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${imageCheckStatus === 'passed' ? 'border-[#6B2C6B] bg-[#F3E8FF]/30' : 'border-gray-200 hover:border-gray-300'}`}>
                      {imagePreview ? (
                        <div className="relative inline-block">
                          <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg mx-auto" />
                          <button onClick={() => { setImagePreview(null); setImageCheckStatus('idle'); setCategory(''); }} className="absolute -top-2 -right-2 p-1 bg-[#6B2C6B] text-white rounded-full hover:bg-[#5a245a]"><XIcon /></button>
                          {imageCheckStatus === 'passed' && (<div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#6B2C6B] text-white text-xs rounded-full flex items-center gap-1"><ShieldCheckIcon /> Safe</div>)}
                        </div>
                      ) : imageCheckStatus === 'checking' ? (
                        <div className="py-4"><LoaderIcon className="w-8 h-8 mx-auto text-[#6B2C6B]" /><p className="text-sm text-gray-500 mt-2">Checking image safety...</p></div>
                      ) : (
                        <label className="cursor-pointer block py-4"><UploadIcon className="mx-auto text-gray-400 mb-2 w-10 h-10" /><span className="text-sm text-[#6B2C6B] font-medium">Click to upload</span><input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /></label>
                      )}
                    </div>
                    {rejectionMessage && <p className="text-xs text-[#6B2C6B] mt-1 bg-[#F3E8FF] p-2 rounded">{rejectionMessage}</p>}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} disabled={imageCheckStatus !== 'passed'} className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#6B2C6B] outline-none ${imageCheckStatus !== 'passed' ? 'bg-gray-50 text-gray-400' : ''}`}>
                      <option value="">Select category</option><option value="footwear">Footwear</option><option value="apparel">Apparel</option><option value="electronics">Electronics</option><option value="food">Food & Beverage</option><option value="beauty">Beauty</option><option value="books">Books</option><option value="general">General</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    {category === 'books' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-semibold text-gray-700 mb-2">Book Title</label><input type="text" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} placeholder="Title" className="w-full p-3 border-2 border-gray-200 rounded-xl" /></div>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-2">Author</label><input type="text" value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} placeholder="Author" className="w-full p-3 border-2 border-gray-200 rounded-xl" /></div>
                      </div>
                    ) : (<><label className="block text-sm font-semibold text-gray-700 mb-2">Brand (optional)</label><input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Brand name" disabled={imageCheckStatus !== 'passed'} className={`w-full p-3 border-2 border-gray-200 rounded-xl ${imageCheckStatus !== 'passed' ? 'bg-gray-50 text-gray-400' : ''}`} /></>)}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4"><label className="block text-sm font-semibold text-gray-700 mb-2">Type</label><select value={category} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#6B2C6B] outline-none"><option value="">Select</option>{textCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
                  <div className="mb-4"><label className="block text-sm font-semibold text-gray-700 mb-2">Content <span className="text-[#6B2C6B]">*</span></label><textarea value={textPrompt} onChange={(e) => setTextPrompt(e.target.value)} placeholder="Describe what you want to post..." rows={4} className="w-full p-3 border-2 border-gray-200 rounded-xl resize-none" /></div>
                </>
              )}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Platform</label><select value={platform} onChange={(e) => handlePlatformChange(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl"><option value="instagram">Instagram</option><option value="twitter">Twitter/X</option><option value="linkedin">LinkedIn</option><option value="facebook">Facebook</option><option value="tiktok">TikTok</option></select><p className="text-xs text-gray-500 mt-1">Max {platformConfig[platform]?.charLimit.toLocaleString()}</p></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Mood</label><select value={mood} onChange={(e) => setMood(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl"><option value="professional">Professional</option><option value="casual">Casual</option><option value="enthusiastic">Enthusiastic</option><option value="humorous">Humorous</option><option value="inspirational">Inspirational</option></select></div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1"><GlobeIcon className="w-4 h-4" /> Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl">{Object.entries(languageConfig).map(([key, lang]) => (<option key={key} value={key}>{lang.code} {lang.name}</option>))}</select>
                {language !== 'english' && (<p className="text-xs text-[#6B2C6B] mt-1">Post will be generated in {languageConfig[language].name} with localized hashtags</p>)}
              </div>
              {showPlatformWarning && (<div className="mb-4 p-3 bg-[#F3E8FF] border border-[#6B2C6B]/20 rounded-xl flex items-start gap-2"><AlertIcon className="text-[#6B2C6B] flex-shrink-0 mt-0.5" /><div><p className="text-sm text-[#6B2C6B] font-semibold">Platform changed</p><p className="text-xs text-[#8B3A8B]">Click "Regenerate" for best results on {platformConfig[platform]?.name}.</p></div></div>)}
              <div className="mb-4"><label className="block text-sm font-semibold text-gray-700 mb-2">Highlight ({selectedFeatures.length})</label><div className="flex flex-wrap gap-2">{(features[category] || features.general).map(f => (<button key={f} onClick={() => toggleFeature(f)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedFeatures.includes(f) ? 'bg-[#6B2C6B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f}</button>))}</div></div>
              {error && <div className="mb-4 p-4 bg-[#F3E8FF] border border-[#6B2C6B]/20 rounded-xl text-[#6B2C6B] text-sm">{error}</div>}
            </div>
            <button onClick={handleGenerate} disabled={isGenerating || (postType === 'product' && imageCheckStatus !== 'passed') || (postType === 'text' && !textPrompt.trim())} className="w-full p-4 bg-gradient-to-r from-[#6B2C6B] via-[#8B3A8B] to-[#6B2C6B] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all disabled:opacity-50 mt-4">{isGenerating ? <><LoaderIcon /> Generating...</> : <><WandIcon /> Generate Post</>}</button>
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[550px]">
            <div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><WandIcon /> Generated Content</h3>
              {generatedContent ? (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2"><span className="text-[#6B2C6B]">{platformConfig[platform]?.icon}</span><span className="font-semibold text-[#6B2C6B]">{platformConfig[platform]?.name}</span>{isNonEnglishGenerated && generatedLanguage && (<span className="text-xs bg-[#F3E8FF] text-[#6B2C6B] px-2 py-1 rounded-full">{languageConfig[generatedLanguage].code} {languageConfig[generatedLanguage].name}</span>)}</div>
                    <div className="text-sm"><span className={`font-semibold ${isOverLimit ? 'text-[#6B2C6B]' : isNearLimit ? 'text-[#8B3A8B]' : 'text-gray-500'}`}>{charCount.toLocaleString()}</span><span className="text-gray-400">/{charLimit.toLocaleString()}</span></div>
                  </div>
                  <div className="mb-4 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full transition-all ${isOverLimit ? 'bg-[#6B2C6B]' : isNearLimit ? 'bg-[#8B3A8B]' : 'bg-[#6B2C6B]/50'}`} style={{ width: `${Math.min(charPercentage, 100)}%` }} /></div>
                  {isOverLimit && (<div className="mb-4 p-3 bg-[#F3E8FF] border border-[#6B2C6B]/20 rounded-xl flex items-start gap-2"><AlertIcon className="text-[#6B2C6B] flex-shrink-0 mt-0.5" /><p className="text-sm text-[#6B2C6B]">Content exceeds {platformConfig[platform]?.name} limit by {(charCount - charLimit).toLocaleString()} characters.</p></div>)}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4" style={{ direction: isGeneratedRTL ? 'rtl' : 'ltr', textAlign: isGeneratedRTL ? 'right' : 'left' }}><p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{generatedContent}</p></div>
                  {isNonEnglishGenerated && generatedLanguage && (<div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg"><p className="text-xs text-yellow-800">⚠️ AI-generated {languageConfig[generatedLanguage].name} content. Native speaker review recommended.</p></div>)}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button onClick={handleCopy} className="p-3 bg-white border-2 border-gray-200 rounded-xl font-semibold flex items-center justify-center gap-2 hover:border-[#6B2C6B] transition-all">{copySuccess ? <><CheckIcon className="text-[#6B2C6B]" /> Copied!</> : <><CopyIcon /> Copy</>}</button>
                    <button onClick={handleGenerate} disabled={isGenerating} className="p-3 bg-[#F3E8FF] text-[#6B2C6B] rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#E9D5FF]"><RefreshIcon className={isGenerating ? 'animate-spin' : ''} /> Regenerate</button>
                  </div>
                </>
              ) : (<div className="flex flex-col items-center justify-center h-64 text-gray-400"><WandIcon /><WandIcon /><WandIcon /><p className="font-medium mt-4">Your post will appear here</p><p className="text-sm mt-1">Fill in details and click Generate</p></div>)}
            </div>
            <button onClick={() => handleShare(platform)} disabled={!generatedContent} className={`w-full p-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all mt-4 disabled:opacity-50 ${platformConfig[platform]?.color}`}>{platformConfig[platform]?.icon}{generatedContent ? (platform === 'instagram' || platform === 'tiktok' ? `Copy & Open ${platformConfig[platform]?.name}` : `Share to ${platformConfig[platform]?.name}`) : `Share to ${platformConfig[platform]?.name}`}</button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2026 Klinchapp. All rights reserved.</p>
          <div className="flex gap-6"><a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#6B2C6B] text-sm font-medium hover:underline">Terms of Service</a><a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#6B2C6B] text-sm font-medium hover:underline">Privacy Policy</a></div>
        </div>
      </footer>
    </div>
  )
}
