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
      // Filter out technical warnings, errors, and image placeholders
      const lines = content.split('\n').filter(line => {
        const trimmed = line.trim()
        return trimmed &&
               !trimmed.startsWith('Warning:') &&
               !trimmed.startsWith('Error:') &&
               !trimmed.startsWith('URL Source:') &&
               !trimmed.includes('shadow DOM') &&
               !trimmed.includes('ocid=') &&
               !trimmed.includes('[Image') &&
               !trimmed.includes('(https://') &&
               !trimmed.includes('](https://') &&
               !trimmed.match(/^\[.*\]\(.*\)$/) && // Remove markdown links
               !trimmed.match(/^\(https?:\/\/.*\)$/) && // Remove standalone URLs
               trimmed.length > 15 &&
               trimmed.split(' ').length > 2 // Ensure it's a meaningful sentence
      })

      if (lines.length === 0) {
        throw new Error('No meaningful content found')
      }

      // Extract title from the first line or create from URL
      const title = lines[0]?.trim() || extractTitleFromUrl(url)

      // Create summary from the content
      let summary = ''

      // Remove title from content for summary
      const contentWithoutTitle = lines.slice(1).join('\n').trim()

      if (contentWithoutTitle.length > 100) {
        // Extract first meaningful sentences
        const sentences = contentWithoutTitle.split(/[.!?]+/).filter(s => {
          const trimmed = s.trim()
          return trimmed.length > 25 &&
                 !trimmed.includes('Warning:') &&
                 !trimmed.includes('Error:') &&
                 !trimmed.includes('URL Source:') &&
                 !trimmed.includes('[Image') &&
                 !trimmed.includes('(https://') &&
                 !trimmed.match(/^\[.*\]\(.*\)/) &&
                 trimmed.split(' ').length > 4 // Ensure meaningful content
        })

        if (sentences.length > 0) {
          summary = sentences.slice(0, 3).join('. ').trim()
          if (summary.length > 300) {
            summary = summary.substring(0, 300) + '...'
          } else if (!summary.endsWith('.')) {
            summary += '.'
          }
        } else {
          // If no good sentences, try to extract meaningful paragraphs
          const paragraphs = contentWithoutTitle.split('\n\n').filter(p => p.trim().length > 50)
          if (paragraphs.length > 0) {
            summary = paragraphs[0].substring(0, 300) + '...'
          } else {
            summary = contentWithoutTitle.substring(0, 300) + '...'
          }
        }
      } else {
        summary = contentWithoutTitle || `Content from ${new URL(url).hostname.replace('www.', '')}`
      }

      // Final check - if summary is still mostly technical jargon or images, provide fallback
      if (summary.includes('shadow DOM') ||
          summary.includes('Warning:') ||
          summary.includes('[Image') ||
          summary.includes('(https://') ||
          summary.length < 30 ||
          summary.split(' ').length < 5) {
        const hostname = new URL(url).hostname.replace('www.', '')
        summary = `Page from ${hostname}. Content contains mostly images or dynamic elements - AI summary not available for this type of content.`
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
      summary: `Bookmark saved from ${hostname}. AI summary temporarily unavailable - some sites block content extraction.`,
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
