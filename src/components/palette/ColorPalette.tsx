// src/components/palette/ColorPalette.tsx
import type { PaletteColor } from '../../types'

interface Props { colors: PaletteColor[] }

export function ColorPalette({ colors }: Props) {
  return (
    <ul className="flex gap-3 flex-wrap" role="list">
      {colors.map((c, i) => (
        <li key={i} className="flex flex-col items-center gap-1">
          <div
            className="w-16 h-16 rounded-xl border border-neutral-700 shadow-inner"
            style={{ background: c.hex }}
            title={c.hex}
          />
          <span className="text-xs text-neutral-300 font-mono">{c.hex}</span>
          <span className="text-xs text-neutral-500">{c.role}</span>
        </li>
      ))}
    </ul>
  )
}
