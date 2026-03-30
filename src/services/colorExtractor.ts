// src/services/colorExtractor.ts
import type { PaletteColor, HexColor } from '../types'

export function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.replace('#', ''), 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}

export function rgbToHex([r, g, b]: [number, number, number]): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

function distance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2)
}

export function kMeans(
  pixels: [number, number, number][],
  k: number,
  maxIter = 20
): [number, number, number][] {
  // Seed centroids from evenly-spaced pixels
  let centroids = Array.from({ length: k }, (_, i) =>
    pixels[Math.floor((i / k) * pixels.length)]
  )

  for (let iter = 0; iter < maxIter; iter++) {
    const clusters: [number, number, number][][] = Array.from({ length: k }, () => [])
    for (const p of pixels) {
      let best = 0, bestDist = Infinity
      for (let i = 0; i < k; i++) {
        const d = distance(p, centroids[i])
        if (d < bestDist) { bestDist = d; best = i }
      }
      clusters[best].push(p)
    }
    centroids = clusters.map(cluster => {
      if (cluster.length === 0) return centroids[0]
      const sum = cluster.reduce(
        (acc, p) => [acc[0]+p[0], acc[1]+p[1], acc[2]+p[2]] as [number,number,number],
        [0,0,0] as [number,number,number]
      )
      return [
        Math.round(sum[0]/cluster.length),
        Math.round(sum[1]/cluster.length),
        Math.round(sum[2]/cluster.length),
      ] as [number,number,number]
    })
  }
  return centroids
}

// Heuristic role assignment based on perceived lightness and saturation
export function assignRoles(hexColors: string[]): PaletteColor[] {
  const withLightness = hexColors.map(hex => {
    const [r, g, b] = hexToRgb(hex)
    const lightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    const max = Math.max(r, g, b) / 255
    const min = Math.min(r, g, b) / 255
    const saturation = max === 0 ? 0 : (max - min) / max
    return { hex, lightness, saturation }
  })

  const sorted = [...withLightness].sort((a, b) => b.lightness - a.lightness)
  const roles = ['background', 'text', 'primary', 'secondary', 'accent']

  return sorted.map((c, i) => ({
    hex: c.hex as HexColor,
    role: roles[i] ?? `extra-${i - roles.length + 1}`,
  }))
}

export function extractColorsFromCanvas(canvas: HTMLCanvasElement, k = 6): PaletteColor[] {
  const ctx = canvas.getContext('2d')
  if (!ctx) return []
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixels: [number, number, number][] = []
  // Sample every 10th pixel to keep runtime reasonable
  for (let i = 0; i < data.length; i += 40) {
    if (data[i + 3] > 128) { // skip transparent
      pixels.push([data[i], data[i + 1], data[i + 2]])
    }
  }
  const centroids = kMeans(pixels, k)
  return assignRoles(centroids.map(rgbToHex))
}
