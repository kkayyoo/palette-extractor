// src/components/palette/PaletteView.tsx
import { useApp } from '../../context/AppContext'
import { ColorPalette } from './ColorPalette'
import { ColorEditor } from './ColorEditor'
import { KeywordTags } from './KeywordTags'
import type { PaletteColor } from '../../types'

export function PaletteView() {
  const { state, updateProject } = useApp()
  const project = state.projects.find(p => p.id === state.activeProjectId)
  const palette = project?.palette

  if (!palette) return (
    <div className="text-neutral-500 text-center mt-20">Select a palette from the sidebar.</div>
  )

  function handleColorsChange(colors: PaletteColor[]) {
    if (!project) return
    updateProject(project.id, { palette: { ...palette!, colors } })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{palette.name}</h1>
      <KeywordTags keywords={palette.keywords} mood={palette.mood} />
      <section>
        <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-3">Colors</h2>
        <ColorPalette colors={palette.colors} />
      </section>
      <section>
        <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-3">Edit Roles</h2>
        <ColorEditor colors={palette.colors} onChange={handleColorsChange} />
      </section>
      <div className="text-xs text-neutral-600">
        Format: {palette.designFormat} · {palette.contentFormat}
      </div>
    </div>
  )
}
