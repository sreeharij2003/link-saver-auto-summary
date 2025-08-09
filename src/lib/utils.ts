export interface PageMetadata {
  title: string
  favicon: string
  description?: string
}

export async function extractPageMetadata(url: string): Promise<PageMetadata> {
  try {
    // For now, use a simple approach without cheerio to avoid build issues
    const urlObj = new URL(url)
    const title = extractTitleFromUrl(url)
    const favicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`

    return {
      title,
      favicon,
      description: `Content from ${urlObj.hostname}`
    }
  } catch (error) {
    console.error('Error extracting metadata:', error)
    return {
      title: url,
      favicon: '',
      description: ''
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

export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}
