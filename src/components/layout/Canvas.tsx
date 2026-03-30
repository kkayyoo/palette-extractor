// src/components/layout/Canvas.tsx
import { useApp } from '../../context/AppContext'
import { ExtractView } from '../extract/ExtractView'

export function Canvas() {
  const { state } = useApp()

  return (
    <main className="flex-1 overflow-auto bg-neutral-950 p-6 text-neutral-100">
      {state.view === 'extract' && <ExtractView />}
      {state.view === 'palette' && <div className="text-neutral-500">Palette view — Task 15</div>}
      {state.view === 'template' && <div className="text-neutral-500">Template view — Task 16</div>}
      {state.view === 'export' && <div className="text-neutral-500">Export view — Task 17</div>}
    </main>
  )
}
