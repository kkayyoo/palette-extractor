// src/components/palette/ColorEditor.tsx
import type { PaletteColor } from '../../types'

const ROLES = ['background', 'text', 'primary', 'secondary', 'accent']

interface Props {
  colors: PaletteColor[]
  onChange: (colors: PaletteColor[]) => void
}

export function ColorEditor({ colors, onChange }: Props) {
  function swapRole(index: number, newRole: string) {
    const updated = colors.map((c, i) => {
      if (i === index) return { ...c, role: newRole }
      if (c.role === newRole) return { ...c, role: colors[index].role } // swap
      return c
    })
    onChange(updated)
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {colors.map((c, i) => (
        <div key={i} className="flex items-center gap-3 bg-neutral-800 rounded-lg p-3">
          <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ background: c.hex }} />
          <div className="flex-1">
            <div className="font-mono text-sm text-neutral-200">{c.hex}</div>
            <select
              value={c.role}
              onChange={e => swapRole(i, e.target.value)}
              className="mt-1 w-full bg-neutral-700 border-none rounded text-xs text-neutral-300 focus:outline-none"
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      ))}
    </div>
  )
}
