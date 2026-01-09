'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

// Monoline SVG Icons - All in brand style
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

const CameraIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>
)

const PencilIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
)

const UploadIcon = () => (
  <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
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

const RocketIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
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
  const [mood, setMood] = useState('professional')
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
    setRemainingPosts(profile ? profile.posts_limit - profile.posts_this_month : null)
    
    const { data: posts } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
    if (posts) setPostHistory(posts)
    setLoading(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handlePostTypeChange = (newType: 'product' | 'text') => {
    setImagePreview(null)
    setImageCheckStatus('idle')
    setRejectionMessage('')
    setCategory('')
    setBrandName('')
    setSelectedFeatures([])
    setTextPrompt('')
    setBookTitle('')
    setBookAuthor('')
    setGeneratedContent('')
    setError('')
    setPostType(newType)
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
      const response = await fetch('/api/check-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image })
      })
      const data = await response.json()
      return data.safe === true
    } catch { return true }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setImageCheckStatus('checking')
    setRejectionMessage('')
    setImagePreview(null)
    
    const reader = new FileReader()
    reader.onload = async (event) => {
      const result = event.target?.result as string
      const compressed = await compressImage(result)
      const base64 = compressed.split(',')[1]
      const isSafe = await checkImageSafety(base64)
      
      if (!isSafe) {
        setImageCheckStatus('failed')
        setRejectionMessage('This image may contain inappropriate content. Please select a different image.')
        setImagePreview(null)
        return
      }
      setImagePreview(compressed)
      setImageCheckStatus('passed')
    }
    reader.readAsDataURL(file)
  }

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature])
  }

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory)
    setSelectedFeatures([])
    if (newCategory !== 'books') { setBookTitle(''); setBookAuthor('') }
  }

  const handleGenerate = async () => {
    setError('')
    setIsGenerating(true)
    
    try {
      const body: any = { postType, platform, mood, features: selectedFeatures }

      if (postType === 'product') {
        if (!imagePreview || imageCheckStatus !== 'passed') {
          setError('Please upload a valid image')
          setIsGenerating(false)
          return
        }
        body.category = category
        body.brandName = brandName
        body.imageBase64 = imagePreview.split(',')[1]
        if (category === 'books') { body.bookTitle = bookTitle; body.bookAuthor = bookAuthor }
      } else {
        if (!textPrompt.trim()) {
          setError('Please describe what you want to post about')
          setIsGenerating(false)
          return
        }
        body.textPrompt = textPrompt
        body.category = category
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      if (!response.ok) { setError(data.message || 'Failed to generate'); setIsGenerating(false); return }

      setGeneratedContent(data.content)
      setRemainingPosts(data.remainingPosts)
      checkUser()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FDFAFF] to-[#FDF2F8]">
        <LoaderIcon className="w-8 h-8 text-[#6B2C6B]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFAFF] via-[#FDF2F8] to-[#FFF8F8]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Klinchapp" className="w-12 h-12 rounded-xl object-contain shadow-sm bg-white" />
            <span className="text-xl font-extrabold text-[#6B2C6B]">Klinchapp</span>
          </div>
          
          <div className="flex items-center gap-3">
            {remainingPosts !== null && (
              <div className="px-4 py-2 bg-[#F3E8FF] rounded-full text-sm font-semibold text-[#6B2C6B]">
                {remainingPosts} posts left
              </div>
            )}
            
            <button onClick={() => setShowHistory(!showHistory)} className={`p-2.5 rounded-lg transition-all ${showHistory ? 'bg-[#6B2C6B] text-white' : 'text-gray-600 hover:bg-gray-100'}`} title="History">
              <ClockIcon />
            </button>
            
            <button onClick={() => setShowSettings(!showSettings)} className={`p-2.5 rounded-lg transition-all ${showSettings ? 'bg-[#6B2C6B] text-white' : 'text-gray-600 hover:bg-gray-100'}`} title="Settings">
              <CogIcon />
            </button>
            
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <img src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}&background=6B2C6B&color=fff`} alt="Profile" className="w-8 h-8 rounded-full" />
              <button onClick={signOut} className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-all" title="Sign Out">
                <LogOutIcon />
              </button>
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
            {postHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No posts yet</p>
            ) : (
              <div className="space-y-3">
                {postHistory.map((post, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold capitalize text-[#6B2C6B]">{post.platform}</span>
                      <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">{post.content}</p>
                  </div>
                ))}
              </div>
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
          <div className="p-6 space-y-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Account</h4>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Plan</h4>
              <p className="text-sm text-gray-600">{profile?.plan || 'Free'} Plan</p>
              <p className="text-xs text-gray-400 mt-1">{profile?.posts_this_month || 0} / {profile?.posts_limit || 10} posts this month</p>
            </div>
            <button onClick={signOut} className="w-full p-3 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-all flex items-center justify-center gap-2">
              <LogOutIcon /> Sign Out
            </button>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Rejection Message */}
        {rejectionMessage && (
          <div className="mb-6 p-5 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="text-red-500"><ShieldCheckIcon /></div>
              <div className="flex-1">
                <h3 className="font-bold text-red-800 mb-1">Image Rejected</h3>
                <p className="text-red-700 text-sm mb-3">{rejectionMessage}</p>
                <button onClick={() => setRejectionMessage('')} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Try Another</button>
              </div>
            </div>
          </div>
        )}

        {/* Checking Status */}
        {imageCheckStatus === 'checking' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
            <LoaderIcon className="w-5 h-5 text-blue-600" />
            <p className="text-blue-800 font-medium">Checking image safety...</p>
          </div>
        )}

        {/* Post Type Selector */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-[#6B2C6B] mb-4">What would you like to create?</h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handlePostTypeChange('product')} className={`p-6 rounded-xl border-2 text-left transition-all ${postType === 'product' ? 'border-[#6B2C6B] bg-[#F3E8FF]' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="text-[#6B2C6B] mb-3"><CameraIcon /></div>
              <div className="font-bold text-gray-800">Product Post</div>
              <div className="text-sm text-gray-500 mt-1">Upload an image</div>
            </button>
            <button onClick={() => handlePostTypeChange('text')} className={`p-6 rounded-xl border-2 text-left transition-all ${postType === 'text' ? 'border-[#6B2C6B] bg-[#F3E8FF]' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="text-[#6B2C6B] mb-3"><PencilIcon /></div>
              <div className="font-bold text-gray-800">Text Post</div>
              <div className="text-sm text-gray-500 mt-1">Describe your content</div>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              {postType === 'product' ? <><CameraIcon /> Product Details</> : <><PencilIcon /> Post Content</>}
            </h3>

            {postType === 'product' ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Image <span className="text-red-500">*</span></label>
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${imageCheckStatus === 'passed' ? 'border-green-400 bg-green-50' : imageCheckStatus === 'checking' ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-[#6B2C6B]'}`}>
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg mx-auto" />
                        <button onClick={() => { setImagePreview(null); setImageCheckStatus('idle') }} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"><XIcon /></button>
                        {imageCheckStatus === 'passed' && (
                          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><ShieldCheckIcon /> Safe</div>
                        )}
                      </div>
                    ) : imageCheckStatus === 'checking' ? (
                      <div className="py-4"><LoaderIcon className="w-10 h-10 text-blue-500 mx-auto mb-2" /><span className="text-blue-600 font-medium">Checking...</span></div>
                    ) : (
                      <label className="cursor-pointer">
                        <UploadIcon />
                        <span className="text-[#6B2C6B] font-semibold block mt-2">Click to upload</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                {imageCheckStatus === 'passed' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#6B2C6B] outline-none">
                        <option value="">Select</option>
                        <option value="footwear">Footwear</option>
                        <option value="books">Books</option>
                        <option value="apparel">Apparel</option>
                        <option value="electronics">Electronics</option>
                        <option value="food">Food</option>
                        <option value="beauty">Beauty</option>
                        <option value="general">Other</option>
                      </select>
                    </div>

                    {category === 'books' && (
                      <div className="mb-4 p-4 bg-[#F3E8FF] rounded-xl space-y-3">
                        <input type="text" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} placeholder="Book Title" className="w-full p-3 border-2 border-[#6B2C6B]/20 rounded-xl" />
                        <input type="text" value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} placeholder="Author" className="w-full p-3 border-2 border-[#6B2C6B]/20 rounded-xl" />
                      </div>
                    )}

                    {category && category !== 'books' && (
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Brand (optional)</label>
                        <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g., Nike" className="w-full p-3 border-2 border-gray-200 rounded-xl" />
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                  <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#6B2C6B] outline-none">
                    <option value="">Select</option>
                    {textCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Content <span className="text-red-500">*</span></label>
                  <textarea value={textPrompt} onChange={(e) => setTextPrompt(e.target.value)} placeholder="Describe what you want to post..." rows={4} className="w-full p-3 border-2 border-gray-200 rounded-xl resize-none" />
                </div>
              </>
            )}

            {(postType === 'text' || imageCheckStatus === 'passed') && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Platform</label>
                    <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl">
                      <option value="instagram">Instagram</option>
                      <option value="twitter">Twitter/X</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="facebook">Facebook</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mood</label>
                    <select value={mood} onChange={(e) => setMood(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl">
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="enthusiastic">Enthusiastic</option>
                      <option value="humorous">Humorous</option>
                      <option value="inspirational">Inspirational</option>
                    </select>
                  </div>
                </div>

                {category && (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Highlight ({selectedFeatures.length})</label>
                    <div className="flex flex-wrap gap-2">
                      {(features[category] || features.general).map(f => (
                        <button key={f} onClick={() => toggleFeature(f)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedFeatures.includes(f) ? 'bg-[#6B2C6B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f}</button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

            <button onClick={handleGenerate} disabled={isGenerating || (postType === 'product' && imageCheckStatus !== 'passed') || (postType === 'text' && !textPrompt.trim())} className="w-full p-4 bg-gradient-to-r from-[#6B2C6B] via-[#8B3A8B] to-[#6B2C6B] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all disabled:opacity-50">
              {isGenerating ? <><LoaderIcon /> Generating...</> : <><WandIcon /> Generate Post</>}
            </button>
          </div>

          {/* Output Panel */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><WandIcon /> Generated Content</h3>
            
            {generatedContent ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-semibold text-[#6B2C6B] capitalize">{platform}</span>
                  <span className="text-sm text-gray-500">{generatedContent.split(/\s+/).length} words</span>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-4 min-h-[200px]">
                  <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{generatedContent}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleCopy} className="p-3 bg-white border-2 border-gray-200 rounded-xl font-semibold flex items-center justify-center gap-2 hover:border-[#6B2C6B] transition-all">
                    {copySuccess ? <><CheckIcon className="text-green-500" /> Copied!</> : <><CopyIcon /> Copy</>}
                  </button>
                  <button onClick={handleGenerate} disabled={isGenerating} className="p-3 bg-[#F3E8FF] text-[#6B2C6B] rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#E9D5FF]">
                    <RefreshIcon className={isGenerating ? 'animate-spin' : ''} /> Regenerate
                  </button>
                </div>

                <div className="mt-4 p-4 bg-gradient-to-r from-[#6B2C6B] to-[#8B3A8B] rounded-xl">
                  <button className="w-full p-3 bg-white text-[#6B2C6B] rounded-lg font-bold flex items-center justify-center gap-2">
                    <RocketIcon /> Post to {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    <span className="text-xs bg-[#6B2C6B] text-white px-2 py-0.5 rounded-full">Soon</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                <WandIcon /><WandIcon /><WandIcon />
                <p className="font-medium mt-4">Your post will appear here</p>
                <p className="text-sm mt-1">Fill in details and click Generate</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 mt-8">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2026 Klinchapp. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/terms" className="text-[#6B2C6B] text-sm font-medium hover:underline">Terms of Service</a>
            <a href="/privacy" className="text-[#6B2C6B] text-sm font-medium hover:underline">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
