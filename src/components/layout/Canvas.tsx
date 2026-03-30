// src/components/layout/Canvas.tsx
import { useApp } from '../../context/AppContext'

export function Canvas() {
  const { state } = useApp()
  return (
    <main className="flex-1 overflow-auto bg-neutral-950 p-6 text-neutral-100">
      {/* Views will be wired in subsequent tasks */}
      <div className="text-neutral-500 text-center mt-20">
        View: <strong>{state.view}</strong>
        {state.activeProjectId && <p className="text-xs mt-2">Project: {state.activeProjectId}</p>}
      </div>
    </main>
  )
}
