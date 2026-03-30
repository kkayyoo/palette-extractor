// src/hooks/useLocalStorage.test.ts
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

beforeEach(() => localStorage.clear())

it('returns default value when key is absent', () => {
  const { result } = renderHook(() => useLocalStorage('x', 42))
  expect(result.current[0]).toBe(42)
})

it('persists value to localStorage', () => {
  const { result } = renderHook(() => useLocalStorage('x', 0))
  act(() => result.current[1](99))
  expect(localStorage.getItem('x')).toBe('99')
})

it('reads existing value from localStorage', () => {
  localStorage.setItem('x', '"hello"')
  const { result } = renderHook(() => useLocalStorage('x', ''))
  expect(result.current[0]).toBe('hello')
})
