// src/components/layout/Toolbar.tsx
import { useApp } from '../../context/AppContext'
import type { AppView } from '../../types'

const TABS: { label: string; view: AppView }[] = [
  { label: 'Extract', view: 'extract' },
  { label: 'Palette', view: 'palette' },
  { label: 'Templates', view: 'template' },
  { label: 'Export', view: 'export' },
]

export function Toolbar() {
  const { state, setView } = useApp()
  return (
    <header className="h-12 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 gap-2">
      {TABS.map(({ label, view }) => (
        <button
          key={view}
          onClick={() => setView(view)}
          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
            state.view === view
              ? 'bg-indigo-600 text-white'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          {label}
        </button>
      ))}
    </header>
  )
}
