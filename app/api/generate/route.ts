import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const languageNames: Record<string, string> = { english: 'English', spanish: 'Spanish', portuguese: 'Portuguese', french: 'French', arabic: 'Arabic', hindi: 'Hindi' }

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

    const { data: profile } = await supabase.from('profiles').select('posts_this_month, posts_limit, plan').eq('id', user.id).single()
    const postsLimit = profile?.posts_limit || 60
    const postsThisMonth = profile?.posts_this_month || 0

    if (postsThisMonth >= postsLimit) {
      return NextResponse.json({ error: 'Post limit reached', message: `You've used all ${postsLimit} posts for this month. Upgrade to get more!`, upgrade: true }, { status: 403 })
    }

    const body = await request.json()
    const { postType, platform, mood, language, category, brandName, features, imageBase64, textPrompt, bookTitle, bookAuthor, charLimit } = body

    const platformInstructions = getPlatformInstructions(platform, charLimit)
    const languageInstructions = getLanguageInstructions(language || 'english')
    
    let messages: any[] = []

    if (postType === 'product' && imageBase64) {
      const context = category === 'books' ? ` for "${bookTitle}" by ${bookAuthor}` : brandName ? ` from "${brandName}"` : ''
      messages = [{ role: 'user', content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
        { type: 'text', text: `Write a ${mood} ${platform} post for ${category}${context} highlighting: ${features?.slice(0, 3).join(', ')}. ${platformInstructions} ${languageInstructions} Sound authentic, not AI-generated.` }
      ]}]
    } else {
      messages = [{ role: 'user', content: `Write a ${mood} ${platform} post about: ${textPrompt}. ${features?.length ? `Highlight these aspects: ${features.join(', ')}.` : ''} ${platformInstructions} ${languageInstructions} Sound authentic and engaging, not AI-generated.` }]
    }

    const maxTokens = platform === 'twitter' ? 150 : 500
    const response = await anthropic.messages.create({ model: 'claude-sonnet-4-20250514', max_tokens: maxTokens, messages })
    let generatedContent = response.content[0].type === 'text' ? response.content[0].text : ''

    if (charLimit && generatedContent.length > charLimit) { generatedContent = truncateToLimit(generatedContent, charLimit, platform) }

    const { data: post, error: postError } = await supabase.from('posts').insert({
      user_id: user.id, content: generatedContent, platform, mood, language: language || 'english', post_type: postType, category, brand_name: brandName, features_highlighted: features, book_title: bookTitle, book_author: bookAuthor, status: 'draft'
    }).select().single()

    if (postError) { console.error('Error saving post:', postError) }

    // INCREMENT posts_this_month
    const newPostCount = postsThisMonth + 1
    const { error: updateError } = await supabase.from('profiles').update({ posts_this_month: newPostCount }).eq('id', user.id)
    if (updateError) { console.error('Error updating post count:', updateError) }

    await supabase.from('usage_logs').insert({ user_id: user.id, action: 'generate', post_id: post?.id, platform, language: language || 'english', tokens_used: response.usage?.output_tokens || 0 })

    return NextResponse.json({ success: true, content: generatedContent, postId: post?.id, charCount: generatedContent.length, charLimit, language: language || 'english', remainingPosts: postsLimit - newPostCount })
  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: 'Failed to generate content', message: error.message }, { status: 500 })
  }
}

function getPlatformInstructions(platform: string, charLimit?: number): string {
  switch (platform) {
    case 'twitter': return `CRITICAL: Your response MUST be UNDER 280 characters total (including spaces, emojis, and hashtags). This is a HARD LIMIT - do NOT exceed it under any circumstances. Count every character. Keep it punchy. Use only 1-2 short hashtags. NO lengthy explanations.`
    case 'instagram': return `Keep under ${charLimit || 2200} characters. Include relevant emojis and 5-10 hashtags at the end. Be engaging and visual.`
    case 'tiktok': return `Keep under ${charLimit || 2200} characters. Make it trendy, Gen-Z friendly, use emojis. Include 3-5 viral hashtags.`
    case 'linkedin': return `Keep under ${charLimit || 3000} characters. Keep it professional but engaging. Use line breaks for readability. Use only 2-3 relevant hashtags.`
    case 'facebook': return `Keep under ${charLimit || 63206} characters. Conversational tone, encourage engagement with a question. Minimal hashtags.`
    default: return charLimit ? `Keep under ${charLimit} characters.` : ''
  }
}

function getLanguageInstructions(language: string): string {
  if (language === 'english' || !language) { return '' }
  const langName = languageNames[language] || language
  const instructions: Record<string, string> = {
    spanish: `Write the ENTIRE post in Spanish (Español). Use Spanish hashtags (e.g., #Moda, #Estilo, #Calidad). Make it sound natural to native Spanish speakers. Do NOT mix English and Spanish.`,
    portuguese: `Write the ENTIRE post in Portuguese (Português). Use Portuguese hashtags (e.g., #Moda, #Estilo, #Qualidade). Make it sound natural to native Brazilian/Portuguese speakers. Do NOT mix English and Portuguese.`,
    french: `Write the ENTIRE post in French (Français). Use French hashtags (e.g., #Mode, #Style, #Qualité). Make it sound natural to native French speakers. Do NOT mix English and French.`,
    arabic: `Write the ENTIRE post in Arabic (العربية). Use Arabic hashtags (e.g., #موضة, #أناقة, #جودة). Make it sound natural to native Arabic speakers. Do NOT mix English and Arabic. Remember Arabic reads right-to-left.`,
    hindi: `Write the ENTIRE post in Hindi (हिन्दी). Use Hindi hashtags (e.g., #फैशन, #स्टाइल, #गुणवत्ता). Make it sound natural to native Hindi speakers. You may use Hinglish style if appropriate for the platform. Do NOT use only English.`
  }
  return instructions[language] || `Write the ENTIRE post in ${langName}. Use ${langName} hashtags. Make it sound natural to native ${langName} speakers.`
}

function truncateToLimit(content: string, limit: number, platform: string): string {
  if (content.length <= limit) return content
  if (platform === 'twitter') {
    let truncated = content.substring(0, limit - 3)
    const lastPeriod = truncated.lastIndexOf('.'), lastExclaim = truncated.lastIndexOf('!'), lastQuestion = truncated.lastIndexOf('?')
    const lastBreak = Math.max(lastPeriod, lastExclaim, lastQuestion)
    if (lastBreak > limit * 0.5) { truncated = content.substring(0, lastBreak + 1) }
    else { const lastSpace = truncated.lastIndexOf(' '); truncated = lastSpace > limit * 0.7 ? content.substring(0, lastSpace) + '...' : content.substring(0, limit - 3) + '...' }
    return truncated
  }
  let truncated = content.substring(0, limit - 3)
  const lastSpace = truncated.lastIndexOf(' ')
  return lastSpace > limit * 0.8 ? content.substring(0, lastSpace) + '...' : content.substring(0, limit - 3) + '...'
}
