// src/hooks/useAIAnalysis.test.ts
import { renderHook, act } from '@testing-library/react'
import { useAIAnalysis } from './useAIAnalysis'

vi.mock('../services/aiAnalyzer', () => ({
  analyzeColors: vi.fn(),
}))

import { analyzeColors } from '../services/aiAnalyzer'
const mockAnalyzeColors = analyzeColors as ReturnType<typeof vi.fn>

beforeEach(() => {
  mockAnalyzeColors.mockReset()
})

it('returns null and sets error when apiKey is empty', async () => {
  const { result } = renderHook(() => useAIAnalysis())
  let returned: unknown
  await act(async () => {
    returned = await result.current.analyze(['#ff0000'], null, '')
  })
  expect(returned).toBeNull()
  expect(result.current.error).toBe('OpenAI API key required. Add it in Settings.')
  expect(mockAnalyzeColors).not.toHaveBeenCalled()
})

it('sets result and returns it when analyze succeeds', async () => {
  const fakeResult = { palette: [], suggestions: [] } as any
  mockAnalyzeColors.mockResolvedValueOnce(fakeResult)

  const { result } = renderHook(() => useAIAnalysis())
  let returned: unknown
  await act(async () => {
    returned = await result.current.analyze(['#ff0000'], null, 'sk-test')
  })
  expect(returned).toBe(fakeResult)
  expect(result.current.result).toBe(fakeResult)
  expect(result.current.error).toBeNull()
  expect(result.current.isLoading).toBe(false)
})

it('sets error and returns null when analyze throws', async () => {
  mockAnalyzeColors.mockRejectedValueOnce(new Error('Network failure'))

  const { result } = renderHook(() => useAIAnalysis())
  let returned: unknown
  await act(async () => {
    returned = await result.current.analyze(['#ff0000'], null, 'sk-test')
  })
  expect(returned).toBeNull()
  expect(result.current.error).toBe('Network failure')
  expect(result.current.isLoading).toBe(false)
})
