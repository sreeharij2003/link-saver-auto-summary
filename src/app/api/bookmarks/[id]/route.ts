import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const bookmarkId = params.id

    // Check if bookmark exists and belongs to user
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId: user.id
      }
    })

    if (!bookmark) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      )
    }

    // Delete bookmark
    await prisma.bookmark.delete({
      where: { id: bookmarkId }
    })

    return NextResponse.json({ message: 'Bookmark deleted successfully' })
  } catch (error) {
    console.error('Delete bookmark error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const bookmarkId = params.id
    const { title, tags } = await request.json()

    // Check if bookmark exists and belongs to user
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId: user.id
      }
    })

    if (!bookmark) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      )
    }

    // Update bookmark
    const updatedBookmark = await prisma.bookmark.update({
      where: { id: bookmarkId },
      data: {
        ...(title && { title }),
        ...(tags && { tags: JSON.stringify(tags) })
      }
    })

    return NextResponse.json(updatedBookmark)
  } catch (error) {
    console.error('Update bookmark error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
