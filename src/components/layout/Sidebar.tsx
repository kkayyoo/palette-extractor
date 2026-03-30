// src/components/layout/Sidebar.tsx
import { useApp } from '../../context/AppContext'
import type { Project } from '../../types'

export function Sidebar() {
  const { state, setActiveProject, addProject, setView } = useApp()

  function handleNew() {
    const project: Project = {
      id: crypto.randomUUID(),
      name: 'New Project',
      type: 'palette',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    addProject(project)
    setActiveProject(project.id)
    setView('extract')
  }

  const palettes = state.projects.filter(p => p.type === 'palette')
  const templates = state.projects.filter(p => p.type === 'template')

  return (
    <aside className="w-64 h-full bg-neutral-900 text-neutral-100 flex flex-col border-r border-neutral-800">
      <div className="p-4 font-bold text-lg border-b border-neutral-800">Projects</div>
      <div className="p-4">
        <button
          onClick={handleNew}
          aria-label="New project"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded px-3 py-2 text-sm font-medium"
        >
          + New
        </button>
      </div>

      <div className="px-4 text-xs uppercase text-neutral-500 tracking-widest mb-1">Palettes</div>
      <ul className="flex-1 overflow-y-auto px-2">
        {palettes.map(p => (
          <li key={p.id}>
            <button
              onClick={() => { setActiveProject(p.id); setView('palette') }}
              className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-neutral-800 ${state.activeProjectId === p.id ? 'bg-neutral-800' : ''}`}
            >
              <span aria-hidden="true">🎨</span> {p.name}
            </button>
          </li>
        ))}
        {palettes.length === 0 && <li className="px-3 py-2 text-xs text-neutral-600">None yet</li>}
      </ul>

      <div className="px-4 text-xs uppercase text-neutral-500 tracking-widest mb-1 mt-2">Templates</div>
      <ul className="px-2 mb-4 max-h-40 overflow-y-auto">
        {templates.map(p => (
          <li key={p.id}>
            <button
              onClick={() => { setActiveProject(p.id); setView('template') }}
              className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-neutral-800 ${state.activeProjectId === p.id ? 'bg-neutral-800' : ''}`}
            >
              <span aria-hidden="true">📄</span> {p.name}
            </button>
          </li>
        ))}
        {templates.length === 0 && <li className="px-3 py-2 text-xs text-neutral-600">None yet</li>}
      </ul>

      <button className="border-t border-neutral-800 p-4 text-xs text-neutral-500 text-left w-full">
        <span aria-hidden="true">⚙</span> Settings
      </button>
    </aside>
  )
}
