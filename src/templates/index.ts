// src/templates/index.ts
import { buttonTemplates } from './buttons'
import { cardTemplates } from './cards'
import { heroTemplates } from './heroes'
import { footerTemplates } from './footers'
import { backgroundTemplates } from './backgrounds'
import type { TemplateSpec } from './types'

export const ALL_TEMPLATES: TemplateSpec[] = [
  ...buttonTemplates,
  ...cardTemplates,
  ...heroTemplates,
  ...footerTemplates,
  ...backgroundTemplates,
]

export const CATEGORIES = ['button', 'card', 'hero', 'footer', 'background'] as const
export type TemplateCategory = typeof CATEGORIES[number]
