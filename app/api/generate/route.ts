import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    // 1. Verify user is authenticated
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Check user's post limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('posts_this_month, posts_limit, plan')
      .eq('id', user.id)
      .single()

    if (profile && profile.posts_this_month >= profile.posts_limit) {
      return NextResponse.json(
        { 
          error: 'Post limit reached',
          message: `You've used all ${profile.posts_limit} posts for this month. Upgrade to get more!`,
          upgrade: true
        },
        { status: 403 }
      )
    }

    // 3. Parse request body
    const body = await request.json()
    const {
      postType,      // 'product' or 'text'
      platform,      // 'instagram', 'twitter', etc.
      mood,          // 'professional', 'casual', etc.
      category,      // 'footwear', 'books', etc.
      brandName,
      features,      // array of features to highlight
      imageBase64,   // optional, for product posts
      textPrompt,    // for text-only posts
      bookTitle,     // for books category
      bookAuthor,    // for books category
    } = body

    // 4. Build the prompt
    let prompt = ''
    let messages: any[] = []

    if (postType === 'product' && imageBase64) {
      // Product post with image
      const context = category === 'books' 
        ? ` for "${bookTitle}" by ${bookAuthor}` 
        : brandName ? ` from "${brandName}"` : ''
      
      messages = [{
        role: 'user',
        content: [
          { 
            type: 'image', 
            source: { 
              type: 'base64', 
              media_type: 'image/jpeg', 
              data: imageBase64 
            } 
          },
          { 
            type: 'text', 
            text: `Write a ${mood} ${platform} post for ${category}${context} highlighting: ${features?.slice(0, 3).join(', ')}. Max 175 words. ${getPlatformInstructions(platform)} Sound authentic, not AI-generated.`
          }
        ]
      }]
    } else {
      // Text-only post
      messages = [{
        role: 'user',
        content: `Write a ${mood} ${platform} post about: ${textPrompt}. 
        ${features?.length ? `Highlight these aspects: ${features.join(', ')}.` : ''}
        Max 175 words. ${getPlatformInstructions(platform)} 
        Sound authentic and engaging, not AI-generated.`
      }]
    }

    // 5. Call Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 350,
      messages: messages,
    })

    const generatedContent = response.content[0].type === 'text' 
      ? response.content[0].text 
      : ''

    // 6. Save post to database
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: generatedContent,
        platform,
        mood,
        post_type: postType,
        category,
        brand_name: brandName,
        features_highlighted: features,
        book_title: bookTitle,
        book_author: bookAuthor,
        status: 'draft'
      })
      .select()
      .single()

    if (postError) {
      console.error('Error saving post:', postError)
    }

    // 7. Log usage
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      action: 'generate',
      post_id: post?.id,
      platform,
      tokens_used: response.usage?.output_tokens || 0
    })

    // 8. Return generated content
    return NextResponse.json({
      success: true,
      content: generatedContent,
      postId: post?.id,
      wordCount: generatedContent.split(/\s+/).length,
      remainingPosts: profile ? profile.posts_limit - profile.posts_this_month - 1 : null
    })

  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content', message: error.message },
      { status: 500 }
    )
  }
}

function getPlatformInstructions(platform: string): string {
  switch (platform) {
    case 'instagram':
      return 'Include relevant emojis and 5-10 hashtags at the end.'
    case 'tiktok':
      return 'Make it trendy, Gen-Z friendly, use emojis. Include 3-5 viral hashtags.'
    case 'twitter':
      return 'Keep it punchy and concise (under 280 characters if possible). Use 2-3 hashtags.'
    case 'linkedin':
      return 'Keep it professional but engaging. Use line breaks for readability. Minimal hashtags (2-3).'
    case 'facebook':
      return 'Conversational tone, encourage engagement with a question. Minimal hashtags.'
    default:
      return ''
  }
}
