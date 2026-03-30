// src/templates/cards.ts
import type { PaletteColor, DesignFormat } from '../types'
import type { CustomizationOptions, TemplateResult, TemplateSpec } from './types'
import { getColor, borderRadius, speedMs, shadowStyle } from './utils'

function generateBasicCard(
  colors: PaletteColor[], format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const bg = getColor(colors, 'background')
  const text = getColor(colors, 'text')
  const primary = getColor(colors, 'primary')
  const br = borderRadius(format)
  const dur = speedMs(options.animationSpeed)
  const bgValue = format === 'glassmorphism' ? `${bg}cc` : bg
  const backdropFilter = format === 'glassmorphism' ? '\n  backdrop-filter: blur(12px);' : ''

  const css = `.card-basic {
  background: ${bgValue};${backdropFilter}
  color: ${text};
  border: ${format === 'brutalist' ? '3px solid ' + primary : 'none'};
  border-radius: ${br};
  padding: 1.5rem;
  box-shadow: ${format === 'neumorphism' ? '6px 6px 12px rgba(0,0,0,.15), -6px -6px 12px rgba(255,255,255,.1)' : '0 2px 8px rgba(0,0,0,.08)'};
  transition: transform ${dur} ease, box-shadow ${dur} ease;
}
.card-basic:hover { transform: translateY(${options.animationStyle === 'hover-lift' ? '-6px' : '0'}); }`

  const html = `<div class="card-basic"><h3 style="margin:0 0 .5rem">Card Title</h3><p style="margin:0;opacity:.7">Card description goes here.</p></div>`
  return { html, css }
}

function generateImageCard(
  colors: PaletteColor[], format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const bg = getColor(colors, 'background')
  const text = getColor(colors, 'text')
  const primary = getColor(colors, 'primary')
  const secondary = getColor(colors, 'secondary')
  const br = borderRadius(format)
  const dur = speedMs(options.animationSpeed)

  const css = `.card-image {
  background: ${bg};
  color: ${text};
  border-radius: ${br};
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,.12);
  transition: transform ${dur} ease;
}
.card-image:hover { transform: translateY(${options.animationStyle === 'hover-lift' ? '-4px' : '0'}); }
.card-image__cover {
  background: linear-gradient(135deg, ${primary}, ${secondary});
  height: 160px;
}
.card-image__body {
  padding: 1.25rem;
}
.card-image__badge {
  display: inline-block;
  background: ${primary};
  color: #fff;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  margin-bottom: 0.5rem;
}`

  const html = `<div class="card-image">
  <div class="card-image__cover"></div>
  <div class="card-image__body">
    <span class="card-image__badge">Featured</span>
    <h3 style="margin:.25rem 0 .5rem">Image Card</h3>
    <p style="margin:0;opacity:.7;font-size:.9rem">A card with a colorful cover image area.</p>
  </div>
</div>`
  return { html, css }
}

function generatePricingCard(
  colors: PaletteColor[], format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const bg = getColor(colors, 'background')
  const text = getColor(colors, 'text')
  const primary = getColor(colors, 'primary')
  const accent = getColor(colors, 'accent')
  const br = borderRadius(format)
  const dur = speedMs(options.animationSpeed)
  const shadow = shadowStyle(format, primary)

  const css = `.card-pricing {
  background: ${bg};
  color: ${text};
  border: ${format === 'brutalist' ? `3px solid ${primary}` : `1px solid ${primary}33`};
  border-radius: ${br};
  padding: 2rem 1.5rem;
  text-align: center;
  box-shadow: ${shadow !== 'none' ? shadow : '0 4px 20px rgba(0,0,0,.1)'};
  transition: transform ${dur} ease;
}
.card-pricing:hover { transform: translateY(${options.animationStyle === 'hover-lift' ? '-6px' : '0'}); }
.card-pricing__price {
  font-size: 3rem;
  font-weight: bold;
  color: ${primary};
  margin: 1rem 0;
}
.card-pricing__cta {
  display: inline-block;
  background: ${primary};
  color: #fff;
  border: none;
  border-radius: ${br};
  padding: .75rem 2rem;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1.5rem;
  transition: opacity ${dur} ease;
}
.card-pricing__cta:hover { opacity: 0.85; }
.card-pricing__feature {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0;
  font-size: .9rem;
  opacity: .8;
}
.card-pricing__feature li::before { content: "✓  "; color: ${accent}; }`

  const html = `<div class="card-pricing">
  <div style="font-weight:600;font-size:1.1rem">Pro Plan</div>
  <div class="card-pricing__price">$29<span style="font-size:1rem;font-weight:400">/mo</span></div>
  <ul class="card-pricing__feature">
    <li>Unlimited projects</li>
    <li>Priority support</li>
    <li>Advanced analytics</li>
  </ul>
  <button class="card-pricing__cta">Get Started</button>
</div>`
  return { html, css }
}

function generateProfileCard(
  colors: PaletteColor[], format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const bg = getColor(colors, 'background')
  const text = getColor(colors, 'text')
  const primary = getColor(colors, 'primary')
  const secondary = getColor(colors, 'secondary')
  const br = borderRadius(format)
  const dur = speedMs(options.animationSpeed)

  const css = `.card-profile {
  background: ${bg};
  color: ${text};
  border-radius: ${br};
  padding: 2rem 1.5rem;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,0,0,.1);
  transition: transform ${dur} ease;
}
.card-profile:hover { transform: translateY(${options.animationStyle === 'hover-lift' ? '-4px' : '0'}); }
.card-profile__avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${primary}, ${secondary});
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.75rem;
  font-weight: bold;
}
.card-profile__name { font-weight: 700; font-size: 1.2rem; margin: 0 0 .25rem; }
.card-profile__role { opacity: .6; font-size: .9rem; margin: 0 0 1rem; }
.card-profile__btn {
  display: inline-block;
  border: 2px solid ${primary};
  color: ${primary};
  background: transparent;
  border-radius: ${br};
  padding: .5rem 1.25rem;
  cursor: pointer;
  font-size: .9rem;
  transition: background ${dur} ease, color ${dur} ease;
}
.card-profile__btn:hover { background: ${primary}; color: #fff; }`

  const html = `<div class="card-profile">
  <div class="card-profile__avatar">J</div>
  <p class="card-profile__name">Jane Doe</p>
  <p class="card-profile__role">Senior Designer</p>
  <button class="card-profile__btn">Follow</button>
</div>`
  return { html, css }
}

export const cardTemplates: TemplateSpec[] = [
  { id: 'card-basic', label: 'Basic Card', category: 'card', generate: generateBasicCard },
  { id: 'card-image', label: 'Image Card', category: 'card', generate: generateImageCard },
  { id: 'card-pricing', label: 'Pricing Card', category: 'card', generate: generatePricingCard },
  { id: 'card-profile', label: 'Profile Card', category: 'card', generate: generateProfileCard },
]
