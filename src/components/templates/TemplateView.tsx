// src/components/templates/TemplateView.tsx
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { TemplateGrid } from './TemplateGrid'
import { TemplatePreview } from './TemplatePreview'
import { AnimationControls, ANIMATION_STYLES_BY_CATEGORY } from './AnimationControls'
import { ALL_TEMPLATES, CATEGORIES } from '../../templates'
import type { TemplateCategory } from '../../templates'
import type { TemplateSpec } from '../../templates/types'
import type { CustomizationOptions } from '../../templates/types'
import type { Project } from '../../types'

const DEFAULT_OPTIONS: CustomizationOptions = {
  animationStyle: ANIMATION_STYLES_BY_CATEGORY['button'][0], // 'hover-scale'
  animationSpeed: 'default',
  animationIntensity: 'medium',
}

export function TemplateView() {
  const { state, addProject, setActiveProject } = useApp()
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('button')
  const [selected, setSelected] = useState<TemplateSpec | null>(null)
  const [options, setOptions] = useState<CustomizationOptions>(DEFAULT_OPTIONS)

  // Use active palette for colors
  const activePaletteProject = state.projects.find(
    p => p.type === 'palette' && p.id === state.activeProjectId
  )
  const colors = activePaletteProject?.palette?.colors ?? []
  const designFormat = activePaletteProject?.palette?.designFormat ?? 'flat'

  const categoryTemplates = ALL_TEMPLATES.filter(t => t.category === activeCategory)
  const preview = selected ? selected.generate(colors, designFormat, options) : null

  function handleSave() {
    if (!selected || !preview || !activePaletteProject?.palette) return
    const { html, css } = preview
    const project: Project = {
      id: crypto.randomUUID(),
      name: `${selected.label} — ${new Date().toLocaleDateString()}`,
      type: 'template',
      template: {
        category: activeCategory,
        templateId: selected.id,
        appliedPalette: activePaletteProject.id,
        customizations: options,
        generatedCode: `<style>\n${css}\n</style>\n\n${html}`,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    addProject(project)
    setActiveProject(project.id)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Templates</h1>

      {colors.length === 0 && (
        <p className="text-amber-400 text-sm">Select a palette project in the sidebar to apply colors.</p>
      )}

      {/* Category tabs */}
      <div className="flex gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => {
              const firstStyle = ANIMATION_STYLES_BY_CATEGORY[cat]?.[0] ?? 'hover-scale'
              setActiveCategory(cat)
              setSelected(null)
              setOptions(prev => ({ ...prev, animationStyle: firstStyle }))
            }}
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              activeCategory === cat ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <TemplateGrid templates={categoryTemplates} selected={selected} onSelect={setSelected} />

      {selected && (
        <>
          <AnimationControls category={activeCategory} options={options} onChange={setOptions} />
          {preview && <TemplatePreview html={preview.html} css={preview.css} />}
          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-3 font-semibold"
          >
            Save Template
          </button>
        </>
      )}
    </div>
  )
}
