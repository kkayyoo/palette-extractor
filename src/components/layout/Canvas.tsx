// src/components/layout/Canvas.tsx
import { useApp } from '../../context/AppContext'
import { ExtractView } from '../extract/ExtractView'
import { PaletteView } from '../palette/PaletteView'
import { TemplateView } from '../templates/TemplateView'

export function Canvas() {
  const { state } = useApp()

  return (
    <main className="flex-1 overflow-auto bg-neutral-950 p-6 text-neutral-100">
      {state.view === 'extract' && <ExtractView />}
      {state.view === 'palette' && <PaletteView />}
      {state.view === 'template' && <TemplateView />}
      {state.view === 'export' && <div className="text-neutral-500">Export view — Task 17</div>}
    </main>
  )
}
