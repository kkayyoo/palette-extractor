// src/hooks/useColorExtraction.ts
import { useCallback, useState } from 'react'
import { extractColorsFromCanvas } from '../services/colorExtractor'
import type { PaletteColor } from '../types'

export function useColorExtraction() {
  const [colors, setColors] = useState<PaletteColor[]>([])
  const [thumbnail, setThumbnail] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Returns the extracted colors directly so callers don't read stale state
  const extractFromFile = useCallback(async (file: File): Promise<PaletteColor[] | null> => {
    setIsLoading(true)
    setError(null)
    let url: string | null = null
    try {
      // Validate magic bytes for JPEG, PNG, GIF, WEBP
      const header = await file.slice(0, 12).arrayBuffer()
      const bytes = new Uint8Array(header)
      const isValid =
        (bytes[0] === 0xff && bytes[1] === 0xd8) || // JPEG
        (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) || // PNG
        (bytes[0] === 0x47 && bytes[1] === 0x49) || // GIF
        // WEBP: RIFF at 0-3, WEBP at 8-11
        (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
         bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50)
      if (!isValid) throw new Error('Unsupported file type. Please upload JPEG, PNG, GIF, or WEBP.')

      url = URL.createObjectURL(file)
      const img = new Image()
      await new Promise<void>((res, rej) => {
        img.onload = () => res()
        img.onerror = () => rej(new Error('Failed to load image'))
        img.src = url!
      })

      if (img.width === 0 || img.height === 0) throw new Error('Image has zero dimensions.')

      const canvas = document.createElement('canvas')
      const maxDim = 200
      const ratio = Math.min(maxDim / img.width, maxDim / img.height)
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not acquire canvas context.')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const thumb = canvas.toDataURL('image/jpeg', 0.7)
      const extracted = extractColorsFromCanvas(canvas, 6)
      setThumbnail(thumb)
      setColors(extracted)
      return extracted
    } catch (e) {
      setError((e as Error).message)
      return null
    } finally {
      if (url) URL.revokeObjectURL(url)
      setIsLoading(false)
    }
  }, [])

  return { colors, thumbnail, isLoading, error, extractFromFile }
}
