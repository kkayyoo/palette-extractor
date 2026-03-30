// src/templates/heroes.ts
import type { PaletteColor, DesignFormat } from '../types'
import type { CustomizationOptions, TemplateResult, TemplateSpec } from './types'
import { getColor, borderRadius, speedMs } from './utils'

function generateCenteredHero(
  colors: PaletteColor[], format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const bg = getColor(colors, 'background')
  const text = getColor(colors, 'text')
  const primary = getColor(colors, 'primary')
  const accent = getColor(colors, 'accent')
  const br = borderRadius(format)
  const dur = speedMs(options.animationSpeed)
  const heroBg = format === 'glassmorphism'
    ? `linear-gradient(135deg, ${primary}22, ${accent}22)`
    : format === 'brutalist'
    ? primary
    : `linear-gradient(160deg, ${bg} 60%, ${primary}22)`

  const css = `.hero-centered {
  background: ${heroBg};
  color: ${format === 'brutalist' ? '#fff' : text};
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  border: ${format === 'brutalist' ? `4px solid ${text}` : 'none'};
}
.hero-centered h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  margin: 0 0 1rem;
  color: ${format === 'brutalist' ? '#fff' : primary};
}
.hero-centered p {
  font-size: 1.2rem;
  opacity: .75;
  max-width: 560px;
  margin: 0 0 2rem;
}
.hero-centered__cta {
  background: ${primary};
  color: #fff;
  border: ${format === 'brutalist' ? `3px solid #fff` : 'none'};
  border-radius: ${br};
  padding: .875rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform ${dur} ease, opacity ${dur} ease;
}
.hero-centered__cta:hover {
  transform: translateY(${options.animationStyle === 'hover-lift' ? '-3px' : '0'});
  opacity: 0.9;
}`

  const html = `<section class="hero-centered">
  <h1>Build Something Amazing</h1>
  <p>A beautiful, palette-driven hero section to captivate your audience.</p>
  <button class="hero-centered__cta">Get Started</button>
</section>`
  return { html, css }
}

function generateSplitHero(
  colors: PaletteColor[], format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const bg = getColor(colors, 'background')
  const text = getColor(colors, 'text')
  const primary = getColor(colors, 'primary')
  const secondary = getColor(colors, 'secondary')
  const br = borderRadius(format)
  const dur = speedMs(options.animationSpeed)

  const css = `.hero-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 400px;
  background: ${bg};
  color: ${text};
  border: ${format === 'brutalist' ? `4px solid ${primary}` : 'none'};
}
.hero-split__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem;
}
.hero-split h1 {
  font-size: clamp(1.75rem, 4vw, 3rem);
  font-weight: 800;
  color: ${primary};
  margin: 0 0 1rem;
}
.hero-split p {
  opacity: .75;
  margin: 0 0 2rem;
  font-size: 1.05rem;
}
.hero-split__cta {
  align-self: flex-start;
  background: ${primary};
  color: #fff;
  border: none;
  border-radius: ${br};
  padding: .75rem 2rem;
  cursor: pointer;
  font-size: 1rem;
  transition: opacity ${dur} ease;
}
.hero-split__cta:hover { opacity: 0.85; }
.hero-split__visual {
  background: linear-gradient(135deg, ${primary}, ${secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  color: rgba(255,255,255,.2);
  font-weight: 900;
}`

  const html = `<section class="hero-split">
  <div class="hero-split__content">
    <h1>Your Vision,<br>Brought to Life</h1>
    <p>Split-layout hero with your palette colors on the right panel.</p>
    <button class="hero-split__cta">Learn More</button>
  </div>
  <div class="hero-split__visual">◈</div>
</section>`
  return { html, css }
}

function generateAnimatedHero(
  colors: PaletteColor[], format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const primary = getColor(colors, 'primary')
  const accent = getColor(colors, 'accent')
  const secondary = getColor(colors, 'secondary')
  const br = borderRadius(format)
  const dur = speedMs(options.animationSpeed)
  const speed = options.animationSpeed === 'slow' ? '8s' : options.animationSpeed === 'fast' ? '3s' : '5s'

  const css = `@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: none; }
}
@keyframes heroBgShift {
  0%, 100% { background-position: 0% 50%; }
  50%       { background-position: 100% 50%; }
}
.hero-animated {
  background: linear-gradient(135deg, ${primary}, ${accent}, ${secondary});
  background-size: 300% 300%;
  animation: heroBgShift ${speed} ease infinite;
  color: #fff;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  border: ${format === 'brutalist' ? `4px solid #fff` : 'none'};
}
.hero-animated h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  margin: 0 0 1rem;
  animation: fadeInUp 0.6s ease forwards;
}
.hero-animated p {
  font-size: 1.15rem;
  opacity: .9;
  max-width: 520px;
  margin: 0 0 2rem;
  animation: fadeInUp 0.6s 0.15s ease both;
}
.hero-animated__cta {
  background: rgba(255,255,255,.2);
  color: #fff;
  border: 2px solid #fff;
  border-radius: ${br};
  padding: .875rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  animation: fadeInUp 0.6s 0.3s ease both;
  transition: background ${dur} ease;
}
.hero-animated__cta:hover { background: rgba(255,255,255,.35); }
/* fallback bg for non-animation support */
@media (prefers-reduced-motion: reduce) {
  .hero-animated { animation: none; background: ${primary}; }
  .hero-animated h1, .hero-animated p, .hero-animated__cta { animation: none; }
}`

  const html = `<section class="hero-animated">
  <h1>Motion Meets Design</h1>
  <p>An animated gradient hero powered entirely by your extracted palette.</p>
  <button class="hero-animated__cta">Explore Now</button>
</section>`
  return { html, css }
}

export const heroTemplates: TemplateSpec[] = [
  { id: 'hero-centered', label: 'Centered Hero', category: 'hero', generate: generateCenteredHero },
  { id: 'hero-split', label: 'Split Hero', category: 'hero', generate: generateSplitHero },
  { id: 'hero-animated', label: 'Animated Hero', category: 'hero', generate: generateAnimatedHero },
]
