// src/components/templates/TemplateGrid.tsx
import type { TemplateSpec } from '../../templates/types'

interface Props {
  templates: TemplateSpec[]
  selected: TemplateSpec | null
  onSelect: (t: TemplateSpec) => void
}

export function TemplateGrid({ templates, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {templates.map(t => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          className={`text-left rounded-xl border p-4 text-sm font-medium transition-colors ${
            selected?.id === t.id
              ? 'border-indigo-500 bg-indigo-900/30 text-indigo-300'
              : 'border-neutral-700 hover:border-neutral-500 text-neutral-300'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
