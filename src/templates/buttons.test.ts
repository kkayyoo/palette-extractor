// src/templates/buttons.test.ts
import { buttonTemplates } from './buttons'
import type { PaletteColor } from '../types'
import type { CustomizationOptions } from './types'

const colors: PaletteColor[] = [
  { hex: '#ffffff', role: 'background' },
  { hex: '#1a1a2e', role: 'text' },
  { hex: '#e94560', role: 'primary' },
  { hex: '#16213e', role: 'secondary' },
  { hex: '#0f3460', role: 'accent' },
]

const opts: CustomizationOptions = {
  animationStyle: 'hover-scale',
  animationSpeed: 'default',
  animationIntensity: 'medium',
}

it('buttonTemplates exports at least 5 templates', () => {
  expect(buttonTemplates.length).toBeGreaterThanOrEqual(5)
})

it('each button template generates html and css strings', () => {
  for (const t of buttonTemplates) {
    const result = t.generate(colors, 'flat', opts)
    expect(typeof result.html).toBe('string')
    expect(typeof result.css).toBe('string')
    expect(result.html.length).toBeGreaterThan(0)
  }
})

it('generated CSS includes the primary color', () => {
  const result = buttonTemplates[0].generate(colors, 'flat', opts)
  expect(result.css).toMatch(/#e94560/i)
})
