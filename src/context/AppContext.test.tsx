// src/context/AppContext.test.tsx
import { renderHook, act } from '@testing-library/react'
import { AppProvider, useApp } from './AppContext'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
)

beforeEach(() => localStorage.clear())

it('starts with empty projects and extract view', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  expect(result.current.state.projects).toHaveLength(0)
  expect(result.current.state.view).toBe('extract')
})

it('addProject adds to projects list', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  const project = {
    id: '1', name: 'Test', type: 'palette' as const,
    createdAt: 0, updatedAt: 0,
  }
  act(() => result.current.addProject(project))
  expect(result.current.state.projects).toHaveLength(1)
})

it('setView changes the active view', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  act(() => result.current.setView('template'))
  expect(result.current.state.view).toBe('template')
})
