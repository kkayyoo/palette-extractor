// src/templates/types.ts
import type { DesignFormat, PaletteColor } from '../types'

export type AnimationSpeed = 'slow' | 'default' | 'fast'
export type AnimationIntensity = 'subtle' | 'medium' | 'dramatic'

export interface CustomizationOptions {
  animationStyle: string
  animationSpeed: AnimationSpeed
  animationIntensity: AnimationIntensity
}

export interface TemplateResult {
  html: string
  css: string
}

export interface TemplateSpec {
  id: string
  label: string
  category: 'button' | 'card' | 'hero' | 'footer' | 'background'
  generate: (
    colors: PaletteColor[],
    format: DesignFormat,
    options: CustomizationOptions
  ) => TemplateResult
}
