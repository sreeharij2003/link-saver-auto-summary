import axios from 'axios'

const JINA_API_URL = 'https://r.jina.ai'

export interface JinaSummary {
  title: string
  content: string
  summary?: string
  error?: string
}

export async function summarizeUrl(url: string): Promise<JinaSummary> {
  try {
    // Use Jina Reader API to get content
    const response = await axios.get(`${JINA_API_URL}/${url}`, {
      headers: {
        'Accept': 'application/json'
      },
      timeout: 10000
    })

    if (response.data && response.data.data) {
      const data = response.data.data
      const title = data.title || extractTitleFromUrl(url)
      const content = data.content || ''
      const description = data.description || ''

      // Create a smart summary from available content
      let summary = ''

      if (description && description.length > 20) {
        // Use description if available and meaningful
        summary = description
      } else if (content && content.length > 100) {
        // Extract first meaningful paragraph from content
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20)
        if (sentences.length > 0) {
          summary = sentences.slice(0, 2).join('. ').trim()
          if (summary.length > 200) {
            summary = summary.substring(0, 200) + '...'
          } else {
            summary += '.'
          }
        } else {
          summary = content.substring(0, 200) + '...'
        }
      } else {
        summary = `Content from ${new URL(url).hostname.replace('www.', '')}`
      }

      return {
        title,
        content,
        summary
      }
    }

    throw new Error('No data received from Jina API')
  } catch (error) {
    console.error('Jina API error:', error)

    // Fallback: try to get basic page info
    try {
      const fallbackResponse = await axios.get(`${JINA_API_URL}/${url}`, {
        timeout: 5000
      })

      const hostname = new URL(url).hostname.replace('www.', '')
      return {
        title: extractTitleFromUrl(url),
        content: '',
        summary: `Saved link from ${hostname}. Content extraction in progress...`,
        error: 'Summary generation failed'
      }
    } catch (fallbackError) {
      const hostname = new URL(url).hostname.replace('www.', '')
      return {
        title: extractTitleFromUrl(url),
        content: '',
        summary: `Bookmark saved from ${hostname}`,
        error: 'Failed to retrieve content'
      }
    }
  }
}

function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.replace('www.', '')
    const pathname = urlObj.pathname.split('/').filter(Boolean).join(' - ')
    return pathname ? `${hostname} - ${pathname}` : hostname
  } catch {
    return url
  }
}
