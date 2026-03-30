// src/components/templates/AnimationControls.tsx
import type { CustomizationOptions, AnimationSpeed, AnimationIntensity } from '../../templates/types'

const ANIMATION_STYLES_BY_CATEGORY: Record<string, string[]> = {
  button: ['hover-scale', 'ripple', 'glow-pulse', 'slide-fill', 'bounce'],
  card: ['hover-lift', 'tilt', 'border-glow', 'content-reveal', 'flip'],
  hero: ['text-fade-in', 'parallax', 'floating', 'typewriter', 'staggered'],
  footer: ['fade-in-scroll', 'link-hover'],
  background: ['gradient-shift', 'particles', 'wave', 'morphing-blob', 'aurora'],
}

interface Props {
  category: string
  options: CustomizationOptions
  onChange: (options: CustomizationOptions) => void
}

export function AnimationControls({ category, options, onChange }: Props) {
  const styles = ANIMATION_STYLES_BY_CATEGORY[category] ?? []
  const speeds: AnimationSpeed[] = ['slow', 'default', 'fast']
  const intensities: AnimationIntensity[] = ['subtle', 'medium', 'dramatic']

  function update(patch: Partial<CustomizationOptions>) {
    onChange({ ...options, ...patch })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1 uppercase tracking-widest">Animation Style</label>
        <div className="flex flex-wrap gap-2">
          {styles.map(s => (
            <button
              key={s}
              onClick={() => update({ animationStyle: s })}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                options.animationStyle === s
                  ? 'border-indigo-500 bg-indigo-900/40 text-indigo-300'
                  : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1 uppercase tracking-widest">Speed</label>
          <div className="flex gap-2">
            {speeds.map(s => (
              <button
                key={s}
                onClick={() => update({ animationSpeed: s })}
                className={`px-3 py-1 rounded text-xs ${options.animationSpeed === s ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1 uppercase tracking-widest">Intensity</label>
          <div className="flex gap-2">
            {intensities.map(s => (
              <button
                key={s}
                onClick={() => update({ animationIntensity: s })}
                className={`px-3 py-1 rounded text-xs ${options.animationIntensity === s ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
