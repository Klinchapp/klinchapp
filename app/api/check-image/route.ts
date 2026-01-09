import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageBase64 } = body

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      messages: [{
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
            text: 'Does this image contain nudity, explicit content, violence, offensive gestures, hate symbols, or inappropriate material? Respond with only "SAFE" or "UNSAFE".' 
          }
        ]
      }]
    })

    const result = response.content[0].type === 'text' 
      ? response.content[0].text.trim().toUpperCase()
      : 'SAFE'

    const isSafe = result === 'SAFE'

    return NextResponse.json({
      safe: isSafe,
      result: result
    })

  } catch (error: any) {
    console.error('Image safety check error:', error)
    // On error, we allow the image (fail open) but log it
    // You could change this to fail closed (return safe: false) for stricter policy
    return NextResponse.json({
      safe: true,
      error: 'Safety check failed, allowing image'
    })
  }
}
