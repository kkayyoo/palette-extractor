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

    // Deduplicate: keep first occurrence of each role
    const seen = new Set<string>()
    const uniqueColors = palette.colors.filter(c => {
      if (seen.has(c.role)) return false
      seen.add(c.role)
      return true
    })

    const cssVars = uniqueColors
      .map(c => {
        const safeName = c.role.replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '') || 'color'
        return `  --color-${safeName}: ${c.hex};`
      })
      .join('\n')

    code = `/* Palette: ${palette.name} */
/* Mood: ${palette.mood} | Format: ${palette.designFormat} */

:root {
${cssVars}
}
`
  } else if (project.type === 'template' && project.template) {
    code = project.template.generatedCode
  }

  if (!code) return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Export</h1>
      <p className="text-neutral-500 text-sm">{project.name}</p>
      <p className="text-neutral-500 text-sm">No exportable content for this project.</p>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Export</h1>
      <p className="text-neutral-500 text-sm">{project.name}</p>
      <ExportPanel code={code} />
    </div>
  )
}
