// src/templates/utils.ts
import type { PaletteColor, DesignFormat } from '../types'
import type { AnimationSpeed } from './types'

export function getColor(colors: PaletteColor[], role: string, fallback = '#888'): string {
  return colors.find(c => c.role === role)?.hex ?? fallback
}

export function speedMs(speed: AnimationSpeed): string {
  return speed === 'slow' ? '0.5s' : speed === 'fast' ? '0.15s' : '0.25s'
}

export function borderRadius(format: DesignFormat): string {
  if (format === 'brutalist') return '0'
  if (format === 'neumorphism' || format === 'organic') return '12px'
  if (format === 'minimalist' || format === 'flat') return '4px'
  return '6px'
}

export function shadowStyle(format: DesignFormat, primary: string): string {
  if (format === 'neumorphism') return '4px 4px 8px rgba(0,0,0,0.2), -4px -4px 8px rgba(255,255,255,0.1)'
  if (format === 'glassmorphism') return `0 0 20px ${primary}55`
  if (format === 'brutalist') return `4px 4px 0 ${primary}`
  return 'none'
}
