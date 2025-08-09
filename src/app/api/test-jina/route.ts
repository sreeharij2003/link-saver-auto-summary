import { NextRequest, NextResponse } from 'next/server'
import { summarizeUrl } from '@/lib/jina'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 })
  }

  try {
    const result = await summarizeUrl(url)
    return NextResponse.json({
      success: true,
      url,
      result,
      debug: {
        contentLength: result.content?.length || 0,
        summaryLength: result.summary?.length || 0,
        hasError: !!result.error
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      url
    }, { status: 500 })
  }
}
