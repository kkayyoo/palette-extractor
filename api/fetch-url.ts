// api/fetch-url.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { URL } from 'url'

const PRIVATE_IP_PATTERNS = [
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^169\.254\./,          // Cloud metadata (AWS/GCP/Azure IMDS)
  /^::1$/,
  /^::ffff:127\./,        // IPv4-mapped loopback
  /^fe80:/i,              // IPv6 link-local
  /^fc00:/i,              // IPv6 unique local
  /^fd[0-9a-f]{2}:/i,    // IPv6 unique local (fd00::/8)
  /^localhost$/i,
]

function isPrivate(hostname: string): boolean {
  return PRIVATE_IP_PATTERNS.some(p => p.test(hostname))
}

// NOTE: This in-memory rate limit is a best-effort courtesy limit, not a security control.
// It resets on cold start and is not shared across Vercel instances.
// For production, use Vercel's edge rate limiting or an external KV store.
const rateMap = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT = 10
const WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  // Prune stale entries to prevent unbounded memory growth
  for (const [key, entry] of rateMap) {
    if (now > entry.reset) rateMap.delete(key)
  }
  const entry = rateMap.get(ip)
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ?? 'unknown'
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Rate limit exceeded' })

  const { url } = req.query
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'Missing url' })

  let parsed: URL
  try { parsed = new URL(url) } catch { return res.status(400).json({ error: 'Invalid URL' }) }

  if (!['http:', 'https:'].includes(parsed.protocol))
    return res.status(400).json({ error: 'Only HTTP(S) allowed' })

  if (isPrivate(parsed.hostname))
    return res.status(400).json({ error: 'Private/internal URLs not allowed' })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    let redirectCount = 0
    let targetUrl = url
    let response: Response

    while (redirectCount <= 3) {
      response = await fetch(targetUrl, {
        signal: controller.signal,
        redirect: 'manual',
        headers: { 'User-Agent': 'PaletteExtractor/1.0' },
      })

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location')
        if (!location) break
        const next = new URL(location, targetUrl)
        if (!['http:', 'https:'].includes(next.protocol))
          return res.status(400).json({ error: 'Redirect to non-HTTP protocol blocked' })
        if (isPrivate(next.hostname)) return res.status(400).json({ error: 'Redirect to private IP blocked' })
        targetUrl = next.toString()
        redirectCount++
        continue
      }
      break
    }

    const MAX_BYTES = 5 * 1024 * 1024 // 5MB
    const reader = (response!.body as ReadableStream<Uint8Array> | null)?.getReader()
    if (!reader) return res.status(502).json({ error: 'No response body' })

    const chunks: Uint8Array[] = []
    let totalBytes = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      totalBytes += value.length
      if (totalBytes > MAX_BYTES) {
        reader.cancel()
        return res.status(413).json({ error: 'Response too large' })
      }
      chunks.push(value)
    }

    const text = new TextDecoder().decode(
      chunks.reduce((acc, chunk) => {
        const merged = new Uint8Array(acc.length + chunk.length)
        merged.set(acc)
        merged.set(chunk, acc.length)
        return merged
      }, new Uint8Array(0))
    )

    // Extract CSS colors and stylesheet hrefs
    const colors = extractCssColors(text)
    const stylesheetUrls = extractStylesheetUrls(text, targetUrl)

    return res.status(200).json({ colors, stylesheetUrls, html: text.slice(0, 50_000) })
  } catch (err: unknown) {
    if ((err as Error).name === 'AbortError') return res.status(504).json({ error: 'Timeout' })
    return res.status(502).json({ error: 'Fetch failed' })
  } finally {
    clearTimeout(timeout)
  }
}

function extractCssColors(text: string): string[] {
  const hexPattern = /#([0-9a-fA-F]{3,6})\b/g
  const colors = new Set<string>()
  let m: RegExpExecArray | null
  while ((m = hexPattern.exec(text)) !== null) colors.add('#' + m[1])
  return [...colors].slice(0, 50)
}

function extractStylesheetUrls(html: string, base: string): string[] {
  const linkPattern = /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi
  const urls: string[] = []
  let m: RegExpExecArray | null
  while ((m = linkPattern.exec(html)) !== null) {
    try { urls.push(new URL(m[1], base).toString()) } catch { /* skip */ }
  }
  return urls.slice(0, 5)
}
