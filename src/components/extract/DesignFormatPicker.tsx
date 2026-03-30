// src/components/extract/DesignFormatPicker.tsx
import type { DesignFormat } from '../../types'

const FORMAT_DESCRIPTIONS: Record<DesignFormat, string> = {
  minimalist: 'Clean whitespace, thin borders, no shadows',
  brutalist: 'Harsh borders, high contrast, raw aesthetic',
  flat: 'Solid colors, no shadows, clean edges',
  glassmorphism: 'Blur, transparency, gradient accents',
  neumorphism: 'Soft inner/outer shadows, pressed effect',
  retro: 'Vintage colors, decorative borders, serif fonts',
  organic: 'Soft curves, natural colors, blob shapes',
  skeuomorphic: 'Realistic textures, 3D depth, gradients',
}

interface Props {
  suggestions: [DesignFormat, DesignFormat]
  selected: DesignFormat
  onChange: (format: DesignFormat) => void
}

export function DesignFormatPicker({ suggestions, selected, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-neutral-300">Design Format</label>
      <select
        value={selected}
        onChange={e => onChange(e.target.value as DesignFormat)}
        className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-indigo-500"
      >
        {suggestions.map(format => (
          <option key={format} value={format}>
            {format.charAt(0).toUpperCase() + format.slice(1)}
          </option>
        ))}
      </select>
      <p className="text-xs text-neutral-500">{FORMAT_DESCRIPTIONS[selected]}</p>
    </div>
  )
}
