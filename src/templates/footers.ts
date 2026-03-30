// src/templates/footers.ts
import type { PaletteColor, DesignFormat } from '../types'
import type { CustomizationOptions, TemplateResult, TemplateSpec } from './types'
import { getColor, borderRadius, speedMs } from './utils'

function generateSimpleFooter(
  colors: PaletteColor[], format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const bg = getColor(colors, 'text')      // footer uses text color as its bg for contrast
  const text = getColor(colors, 'background')
  const primary = getColor(colors, 'primary')
  const dur = speedMs(options.animationSpeed)

  const footerBg = format === 'glassmorphism'
    ? `rgba(0,0,0,0.6)`
    : format === 'brutalist'
    ? primary
    : bg

  const css = `.footer-simple {
  background: ${footerBg};
  ${format === 'glassmorphism' ? 'backdrop-filter: blur(12px);' : ''}
  color: ${text};
  padding: 2rem;
  text-align: center;
  border-top: ${format === 'brutalist' ? `4px solid #fff` : `1px solid ${primary}44`};
}
.footer-simple__links {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
}
.footer-simple__links a {
  color: ${format === 'brutalist' ? '#fff' : primary};
  text-decoration: none;
  font-size: .9rem;
  transition: opacity ${dur} ease;
}
.footer-simple__links a:hover { opacity: 0.7; }
.footer-simple__copy {
  font-size: .8rem;
  opacity: .6;
  margin: 0;
}`

  const html = `<footer class="footer-simple">
  <ul class="footer-simple__links">
    <li><a href="#">About</a></li>
    <li><a href="#">Privacy</a></li>
    <li><a href="#">Terms</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
  <p class="footer-simple__copy">&copy; 2026 Your Company. All rights reserved.</p>
</footer>`
  return { html, css }
}

function generateMultiColumnFooter(
  colors: PaletteColor[], format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const bg = getColor(colors, 'text')
  const text = getColor(colors, 'background')
  const primary = getColor(colors, 'primary')
  const accent = getColor(colors, 'accent')
  const br = borderRadius(format)
  const dur = speedMs(options.animationSpeed)

  const footerBg = format === 'glassmorphism' ? `rgba(0,0,0,0.7)` : bg

  const css = `.footer-multi {
  background: ${footerBg};
  ${format === 'glassmorphism' ? 'backdrop-filter: blur(16px);' : ''}
  color: ${text};
  padding: 3rem 2rem 1.5rem;
  border-top: ${format === 'brutalist' ? `4px solid ${primary}` : `1px solid ${primary}33`};
}
.footer-multi__grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 2rem;
  max-width: 960px;
  margin: 0 auto 2rem;
}
.footer-multi__brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: ${primary};
  margin: 0 0 .75rem;
}
.footer-multi__tagline {
  font-size: .875rem;
  opacity: .65;
  margin: 0;
  line-height: 1.6;
}
.footer-multi__heading {
  font-size: .8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: ${accent};
  margin: 0 0 .75rem;
}
.footer-multi__links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: .4rem;
}
.footer-multi__links a {
  color: ${text};
  opacity: .7;
  text-decoration: none;
  font-size: .875rem;
  transition: opacity ${dur} ease, color ${dur} ease;
}
.footer-multi__links a:hover { opacity: 1; color: ${primary}; }
.footer-multi__bottom {
  border-top: 1px solid ${text}22;
  padding-top: 1.5rem;
  text-align: center;
  font-size: .8rem;
  opacity: .5;
  max-width: 960px;
  margin: 0 auto;
}
.footer-multi__badge {
  display: inline-block;
  background: ${primary};
  color: #fff;
  padding: .2rem .6rem;
  border-radius: ${br};
  font-size: .7rem;
  font-weight: 700;
  margin-left: .5rem;
  vertical-align: middle;
}`

  const html = `<footer class="footer-multi">
  <div class="footer-multi__grid">
    <div>
      <p class="footer-multi__brand">YourBrand <span class="footer-multi__badge">v2</span></p>
      <p class="footer-multi__tagline">Beautiful design tools for modern teams. Extract, customize, and ship faster.</p>
    </div>
    <div>
      <p class="footer-multi__heading">Product</p>
      <ul class="footer-multi__links">
        <li><a href="#">Features</a></li>
        <li><a href="#">Pricing</a></li>
        <li><a href="#">Changelog</a></li>
      </ul>
    </div>
    <div>
      <p class="footer-multi__heading">Company</p>
      <ul class="footer-multi__links">
        <li><a href="#">About</a></li>
        <li><a href="#">Blog</a></li>
        <li><a href="#">Careers</a></li>
      </ul>
    </div>
    <div>
      <p class="footer-multi__heading">Legal</p>
      <ul class="footer-multi__links">
        <li><a href="#">Privacy</a></li>
        <li><a href="#">Terms</a></li>
        <li><a href="#">Security</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-multi__bottom">&copy; 2026 YourBrand Inc. All rights reserved.</div>
</footer>`
  return { html, css }
}

export const footerTemplates: TemplateSpec[] = [
  { id: 'footer-simple', label: 'Simple Footer', category: 'footer', generate: generateSimpleFooter },
  { id: 'footer-multi', label: 'Multi-column Footer', category: 'footer', generate: generateMultiColumnFooter },
]
