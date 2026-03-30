// src/templates/buttons.ts
import type { PaletteColor, DesignFormat } from '../types'
import type { CustomizationOptions, TemplateResult, TemplateSpec } from './types'

function getColor(colors: PaletteColor[], role: string, fallback = '#888'): string {
  return colors.find(c => c.role === role)?.hex ?? fallback
}

function speedMs(speed: 'slow' | 'default' | 'fast'): string {
  return speed === 'slow' ? '0.5s' : speed === 'fast' ? '0.15s' : '0.25s'
}

function borderRadius(format: DesignFormat): string {
  if (format === 'brutalist') return '0'
  if (format === 'neumorphism' || format === 'organic') return '12px'
  if (format === 'minimalist' || format === 'flat') return '4px'
  return '6px'
}

function shadowStyle(format: DesignFormat, primary: string): string {
  if (format === 'neumorphism') return '4px 4px 8px rgba(0,0,0,0.2), -4px -4px 8px rgba(255,255,255,0.1)'
  if (format === 'glassmorphism') return `0 0 20px ${primary}55`
  if (format === 'brutalist') return `4px 4px 0 ${primary}`
  return 'none'
}

function generatePrimaryButton(
  colors: PaletteColor[], format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const primary = getColor(colors, 'primary')
  const bg = getColor(colors, 'background')
  const dur = speedMs(options.animationSpeed)
  const br = borderRadius(format)
  const shadow = shadowStyle(format, primary)

  const css = `.btn-primary {
  background: ${primary};
  color: ${bg};
  border: ${format === 'brutalist' ? `3px solid ${primary}` : 'none'};
  border-radius: ${br};
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: ${shadow};
  transition: transform ${dur} ease, box-shadow ${dur} ease, opacity ${dur} ease;
  ${format === 'glassmorphism' ? 'backdrop-filter: blur(10px); background: ' + primary + '99;' : ''}
}
.btn-primary:hover {
  transform: scale(${options.animationStyle === 'hover-scale' ? '1.05' : '1'});
  opacity: 0.9;
}`

  const html = `<button class="btn-primary">Click me</button>`
  return { html, css }
}

function generateSecondaryButton(
  colors: PaletteColor[], format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const secondary = getColor(colors, 'secondary')
  const bg = getColor(colors, 'background')
  const dur = speedMs(options.animationSpeed)
  const br = borderRadius(format)

  const css = `.btn-secondary {
  background: ${secondary};
  color: ${bg};
  border-radius: ${br};
  border: none;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: opacity ${dur} ease;
}
.btn-secondary:hover { opacity: 0.85; }`
  return { html: `<button class="btn-secondary">Secondary</button>`, css }
}

function generateOutlineButton(
  colors: PaletteColor[], format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const primary = getColor(colors, 'primary')
  const dur = speedMs(options.animationSpeed)
  const br = borderRadius(format)

  const css = `.btn-outline {
  background: transparent;
  color: ${primary};
  border: 2px solid ${primary};
  border-radius: ${br};
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: background ${dur} ease, color ${dur} ease;
}
.btn-outline:hover {
  background: ${primary};
  color: #fff;
}`
  return { html: `<button class="btn-outline">Outline</button>`, css }
}

function generateGhostButton(
  colors: PaletteColor[], format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const text = getColor(colors, 'text')
  const dur = speedMs(options.animationSpeed)
  const br = borderRadius(format)

  const css = `.btn-ghost {
  background: transparent;
  color: ${text};
  border: none;
  border-radius: ${br};
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: background ${dur} ease;
}
.btn-ghost:hover { background: ${text}20; }`
  return { html: `<button class="btn-ghost">Ghost</button>`, css }
}

function generateIconButton(
  colors: PaletteColor[], format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const primary = getColor(colors, 'primary')
  const dur = speedMs(options.animationSpeed)
  const br = format === 'brutalist' ? '0' : '50%'

  const css = `.btn-icon {
  background: ${primary};
  color: #fff;
  border: none;
  border-radius: ${br};
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: transform ${dur} ease;
}
.btn-icon:hover { transform: ${options.animationStyle === 'bounce' ? 'translateY(-4px)' : 'scale(1.1)'}; }`
  return {
    html: `<button class="btn-icon"><svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="currentColor" opacity="0.3"/><path d="M10 6v8M6 10h8" stroke="currentColor" stroke-width="2"/></svg></button>`,
    css,
  }
}

export const buttonTemplates: TemplateSpec[] = [
  { id: 'btn-primary', label: 'Primary Button', category: 'button', generate: generatePrimaryButton },
  { id: 'btn-secondary', label: 'Secondary Button', category: 'button', generate: generateSecondaryButton },
  { id: 'btn-outline', label: 'Outline Button', category: 'button', generate: generateOutlineButton },
  { id: 'btn-ghost', label: 'Ghost Button', category: 'button', generate: generateGhostButton },
  { id: 'btn-icon', label: 'Icon Button', category: 'button', generate: generateIconButton },
]
