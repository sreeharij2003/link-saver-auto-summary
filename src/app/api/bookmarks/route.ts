import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { extractPageMetadata, isValidUrl } from '@/lib/utils'
import { summarizeUrl } from '@/lib/jina'

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(bookmarks)
  } catch (error) {
    console.error('Get bookmarks error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { url, tags } = await request.json()

    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Valid URL is required' },
        { status: 400 }
      )
    }

    // Extract metadata and generate summary in parallel
    const [metadata, jinaResult] = await Promise.allSettled([
      extractPageMetadata(url),
      summarizeUrl(url)
    ])

    const pageMetadata = metadata.status === 'fulfilled' 
      ? metadata.value 
      : { title: url, favicon: '', description: '' }

    const summary = jinaResult.status === 'fulfilled' 
      ? jinaResult.value.summary 
      : 'Summary generation failed'

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        url,
        title: pageMetadata.title,
        favicon: pageMetadata.favicon,
        summary,
        tags: tags ? JSON.stringify(tags) : null,
        userId: user.id
      }
    })

    return NextResponse.json(bookmark)
  } catch (error) {
    console.error('Create bookmark error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
