// Jina AI Reader API - No API key required, CORS enabled, ~60 calls/hour per IP

export interface JinaSummary {
  title: string
  content: string
  summary?: string
  error?: string
}

export async function summarizeUrl(url: string): Promise<JinaSummary> {
  try {
    // Use Jina Reader API with correct endpoint format
    const target = encodeURIComponent(url)
    const response = await fetch(`https://r.jina.ai/${target}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const content = await response.text()

    if (content && content.length > 50) {
      // Extract title from the first line or create from URL
      const lines = content.split('\n').filter(line => line.trim())
      const title = lines[0]?.trim() || extractTitleFromUrl(url)

      // Create summary from the content
      let summary = ''

      // Remove title from content for summary
      const contentWithoutTitle = lines.slice(1).join('\n').trim()

      if (contentWithoutTitle.length > 100) {
        // Extract first meaningful sentences
        const sentences = contentWithoutTitle.split(/[.!?]+/).filter(s => s.trim().length > 20)
        if (sentences.length > 0) {
          summary = sentences.slice(0, 3).join('. ').trim()
          if (summary.length > 300) {
            summary = summary.substring(0, 300) + '...'
          } else if (!summary.endsWith('.')) {
            summary += '.'
          }
        } else {
          summary = contentWithoutTitle.substring(0, 300) + '...'
        }
      } else {
        summary = contentWithoutTitle || `Content from ${new URL(url).hostname.replace('www.', '')}`
      }

      return {
        title,
        content: contentWithoutTitle,
        summary
      }
    }

    throw new Error('No content received from Jina API')
  } catch (error) {
    console.error('Jina API error:', error)

    // Fallback: return basic info
    const hostname = new URL(url).hostname.replace('www.', '')
    return {
      title: extractTitleFromUrl(url),
      content: '',
      summary: `Bookmark saved from ${hostname}. AI summary temporarily unavailable.`,
      error: 'Failed to retrieve content'
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
