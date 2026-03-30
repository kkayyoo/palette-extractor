// src/templates/templates.test.ts
import { cardTemplates } from './cards'
import { heroTemplates } from './heroes'
import { footerTemplates } from './footers'
import { backgroundTemplates } from './backgrounds'
import type { PaletteColor } from '../types'
import type { CustomizationOptions } from './types'

const colors: PaletteColor[] = [
  { hex: '#fafafa', role: 'background' },
  { hex: '#111111', role: 'text' },
  { hex: '#6c63ff', role: 'primary' },
  { hex: '#48cfad', role: 'secondary' },
  { hex: '#fc5c7d', role: 'accent' },
]
const opts: CustomizationOptions = { animationStyle: 'hover-lift', animationSpeed: 'default', animationIntensity: 'medium' }

const allGroups = [
  { name: 'card', templates: cardTemplates, minCount: 4 },
  { name: 'hero', templates: heroTemplates, minCount: 3 },
  { name: 'footer', templates: footerTemplates, minCount: 2 },
  { name: 'background', templates: backgroundTemplates, minCount: 5 },
]

for (const { name, templates, minCount } of allGroups) {
  it(`${name} templates exports at least ${minCount} templates`, () => {
    expect(templates.length).toBeGreaterThanOrEqual(minCount)
  })

  it(`${name} templates all generate valid html+css`, () => {
    for (const t of templates) {
      const result = t.generate(colors, 'minimalist', opts)
      expect(typeof result.html).toBe('string')
      expect(result.html.length).toBeGreaterThan(0)
      expect(typeof result.css).toBe('string')
    }
  })
}

it('animated hero CSS includes keyframe animation', () => {
  const animated = heroTemplates.find(t => t.id.includes('animated'))!
  const result = animated.generate(colors, 'flat', opts)
  expect(result.css).toMatch(/@keyframes/i)
})

it('primary palette color appears in card CSS output', () => {
  const result = cardTemplates[1].generate(colors, 'flat', opts)
  expect(result.css).toMatch(/#6c63ff/i)
})

it('animated gradient background CSS includes keyframe animation', () => {
  const animated = backgroundTemplates.find(t => t.id.includes('animated'))!
  const result = animated.generate(colors, 'flat', opts)
  expect(result.css).toMatch(/@keyframes/i)
})
