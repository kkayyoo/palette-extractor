// src/context/AppContext.tsx
import React, { createContext, useContext, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { AppState, AppView, Project } from '../types'

const DEFAULT_STATE: AppState = { projects: [], activeProjectId: null, view: 'extract' }

interface AppContextValue {
  state: AppState
  setView: (view: AppView) => void
  addProject: (project: Project) => void
  updateProject: (id: string, patch: Partial<Project>) => void
  deleteProject: (id: string) => void
  setActiveProject: (id: string | null) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useLocalStorage<AppState>('app-state', DEFAULT_STATE)

  const setView = useCallback((view: AppView) =>
    setState(s => ({ ...s, view })), [setState])

  const addProject = useCallback((project: Project) =>
    setState(s => ({ ...s, projects: [...s.projects, project] })), [setState])

  const updateProject = useCallback((id: string, patch: Partial<Project>) =>
    setState(s => ({
      ...s,
      projects: s.projects.map(p => p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p),
    })), [setState])

  const deleteProject = useCallback((id: string) =>
    setState(s => ({
      ...s,
      projects: s.projects.filter(p => p.id !== id),
      activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
    })), [setState])

  const setActiveProject = useCallback((id: string | null) =>
    setState(s => ({ ...s, activeProjectId: id })), [setState])

  return (
    <AppContext.Provider value={{ state, setView, addProject, updateProject, deleteProject, setActiveProject }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
