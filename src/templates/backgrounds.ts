// src/templates/backgrounds.ts
import type { PaletteColor, DesignFormat } from '../types'
import type { CustomizationOptions, TemplateResult, TemplateSpec } from './types'
import { getColor } from './utils'

function generateGradientBackground(
  colors: PaletteColor[], format: DesignFormat, _options: CustomizationOptions
): TemplateResult {
  const primary = getColor(colors, 'primary')
  const secondary = getColor(colors, 'secondary')
  const accent = getColor(colors, 'accent')

  const angle = format === 'brutalist' ? '90deg' : '135deg'
  const css = `.bg-gradient {
  background: linear-gradient(${angle}, ${primary}, ${secondary}, ${accent});
  min-height: 200px;
  width: 100%;
}`

  return { html: '<div class="bg-gradient"></div>', css }
}

function generateAnimatedGradient(
  colors: PaletteColor[], _format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const primary = getColor(colors, 'primary')
  const accent = getColor(colors, 'accent')
  const secondary = getColor(colors, 'secondary')
  const speed = options.animationSpeed === 'slow' ? '8s' : options.animationSpeed === 'fast' ? '3s' : '5s'

  const css = `@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50%       { background-position: 100% 50%; }
}
.bg-gradient-animated {
  background: linear-gradient(135deg, ${primary}, ${accent}, ${secondary});
  background-size: 300% 300%;
  animation: gradientShift ${speed} ease infinite;
  min-height: 200px;
}`

  return { html: '<div class="bg-gradient-animated"></div>', css }
}

function generateParticleBackground(
  colors: PaletteColor[], _format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const bg = getColor(colors, 'background')
  const primary = getColor(colors, 'primary')
  const accent = getColor(colors, 'accent')
  const speed = options.animationSpeed === 'slow' ? '20s' : options.animationSpeed === 'fast' ? '8s' : '14s'

  // CSS-only particle approximation using radial gradients + animation
  const css = `@keyframes particleFloat {
  0%   { transform: translateY(0) translateX(0); opacity: 0.6; }
  33%  { transform: translateY(-30px) translateX(15px); opacity: 1; }
  66%  { transform: translateY(-15px) translateX(-20px); opacity: 0.8; }
  100% { transform: translateY(0) translateX(0); opacity: 0.6; }
}
.bg-particle {
  background: ${bg};
  min-height: 200px;
  position: relative;
  overflow: hidden;
}
.bg-particle::before,
.bg-particle::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  animation: particleFloat ${speed} ease-in-out infinite;
}
.bg-particle::before {
  width: 120px; height: 120px;
  background: ${primary}44;
  top: 10%; left: 15%;
  animation-delay: 0s;
}
.bg-particle::after {
  width: 80px; height: 80px;
  background: ${accent}55;
  top: 50%; left: 65%;
  animation-delay: -${(parseFloat(speed) / 2).toFixed(2)}s;
}`

  return { html: '<div class="bg-particle"></div>', css }
}

function generateWaveBackground(
  colors: PaletteColor[], _format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const primary = getColor(colors, 'primary')
  const secondary = getColor(colors, 'secondary')
  const speed = options.animationSpeed === 'slow' ? '8s' : options.animationSpeed === 'fast' ? '3s' : '5s'

  const css = `@keyframes waveDrift {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.bg-wave {
  position: relative;
  min-height: 200px;
  overflow: hidden;
  background: ${primary}22;
}
.bg-wave svg {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  animation: waveDrift ${speed} linear infinite;
}
.bg-wave svg.bg-wave-back {
  animation-duration: ${(parseFloat(speed) * 1.5).toFixed(2)}s;
  opacity: 0.5;
}`

  const html = `<div class="bg-wave">
  <svg class="bg-wave-back" viewBox="0 0 400 60" preserveAspectRatio="none" fill="${secondary}" opacity="0.4"><path d="M0,30 C100,60 200,0 400,30 L400,60 L0,60 Z"/></svg>
  <svg viewBox="0 0 400 60" preserveAspectRatio="none" fill="${primary}"><path d="M0,30 C100,0 200,60 400,30 L400,60 L0,60 Z"/></svg>
</div>`
  return { html, css }
}

function generateMorphingBlob(
  colors: PaletteColor[], _format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const bg = getColor(colors, 'background')
  const primary = getColor(colors, 'primary')
  const secondary = getColor(colors, 'secondary')
  const accent = getColor(colors, 'accent')
  const speed = options.animationSpeed === 'slow' ? '12s' : options.animationSpeed === 'fast' ? '5s' : '8s'

  const css = `@keyframes blobMorph {
  0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  25%      { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  50%      { border-radius: 50% 60% 30% 60% / 40% 70% 60% 50%; }
  75%      { border-radius: 70% 30% 60% 40% / 30% 50% 70% 60%; }
}
.bg-blob {
  background: ${bg};
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.bg-blob__shape {
  width: 180px;
  height: 180px;
  background: linear-gradient(135deg, ${primary}, ${secondary});
  animation: blobMorph ${speed} ease-in-out infinite;
  position: absolute;
  opacity: 0.6;
}
.bg-blob__shape--2 {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, ${accent}, ${primary});
  animation-delay: -${(parseFloat(speed) / 2).toFixed(2)}s;
  top: 20%;
  right: 15%;
  opacity: 0.4;
}`

  const html = `<div class="bg-blob">
  <div class="bg-blob__shape"></div>
  <div class="bg-blob__shape bg-blob__shape--2"></div>
</div>`
  return { html, css }
}

function generateAuroraBackground(
  colors: PaletteColor[], _format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const bg = getColor(colors, 'background')
  const primary = getColor(colors, 'primary')
  const secondary = getColor(colors, 'secondary')
  const accent = getColor(colors, 'accent')
  const speed = options.animationSpeed === 'slow' ? '15s' : options.animationSpeed === 'fast' ? '6s' : '10s'

  const css = `@keyframes aurora1 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
  33%       { transform: translate(30px, -20px) scale(1.1); opacity: 0.7; }
  66%       { transform: translate(-20px, 30px) scale(0.95); opacity: 0.4; }
}
@keyframes aurora2 {
  0%, 100% { transform: translate(0, 0) scale(1.1); opacity: 0.4; }
  33%       { transform: translate(-40px, 20px) scale(0.9); opacity: 0.6; }
  66%       { transform: translate(25px, -30px) scale(1.15); opacity: 0.3; }
}
.bg-aurora {
  background: ${bg};
  min-height: 200px;
  position: relative;
  overflow: hidden;
}
.bg-aurora__layer {
  position: absolute;
  inset: -20%;
  background: radial-gradient(ellipse at 40% 50%, ${primary}55 0%, transparent 60%),
              radial-gradient(ellipse at 70% 30%, ${secondary}44 0%, transparent 50%),
              radial-gradient(ellipse at 20% 80%, ${accent}33 0%, transparent 55%);
  filter: blur(30px);
  animation: aurora1 ${speed} ease-in-out infinite;
}
.bg-aurora__layer--2 {
  position: absolute;
  inset: -15%;
  background: radial-gradient(ellipse at 80% 60%, ${accent}44 0%, transparent 50%),
              radial-gradient(ellipse at 30% 20%, ${primary}33 0%, transparent 55%);
  filter: blur(40px);
  animation: aurora2 ${speed} ease-in-out infinite;
  animation-delay: -${(parseFloat(speed) / 3).toFixed(2)}s;
}`

  const html = `<div class="bg-aurora">
  <div class="bg-aurora__layer"></div>
  <div class="bg-aurora__layer bg-aurora__layer--2"></div>
</div>`
  return { html, css }
}

export const backgroundTemplates: TemplateSpec[] = [
  { id: 'bg-gradient', label: 'Gradient', category: 'background', generate: generateGradientBackground },
  { id: 'bg-gradient-animated', label: 'Animated Gradient', category: 'background', generate: generateAnimatedGradient },
  { id: 'bg-particle', label: 'Particle (CSS)', category: 'background', generate: generateParticleBackground },
  { id: 'bg-wave', label: 'Wave', category: 'background', generate: generateWaveBackground },
  { id: 'bg-blob', label: 'Morphing Blob', category: 'background', generate: generateMorphingBlob },
  { id: 'bg-aurora', label: 'Aurora', category: 'background', generate: generateAuroraBackground },
]
