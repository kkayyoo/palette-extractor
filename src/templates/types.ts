// src/templates/types.ts
import type { DesignFormat, PaletteColor, CustomizationOptions } from '../types'

export type { AnimationSpeed, AnimationIntensity, CustomizationOptions } from '../types'

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
