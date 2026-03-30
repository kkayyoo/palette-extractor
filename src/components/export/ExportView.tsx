// src/components/export/ExportView.tsx
import { useApp } from '../../context/AppContext'
import { ExportPanel } from './ExportPanel'

export function ExportView() {
  const { state } = useApp()
  const project = state.projects.find(p => p.id === state.activeProjectId)

  if (!project) return (
    <div className="text-neutral-500 text-center mt-20">Select a project to export.</div>
  )

  let code = ''

  if (project.type === 'palette' && project.palette) {
    const { palette } = project
    const cssVars = palette.colors.map(c => `  --color-${c.role}: ${c.hex};`).join('\n')
    code = `/* Palette: ${palette.name} */
/* Mood: ${palette.mood} | Format: ${palette.designFormat} */

:root {
${cssVars}
}
`
  } else if (project.type === 'template' && project.template) {
    code = project.template.generatedCode
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Export</h1>
      <p className="text-neutral-500 text-sm">{project.name}</p>
      <ExportPanel code={code} />
    </div>
  )
}
