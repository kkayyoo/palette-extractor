// src/hooks/useAIAnalysis.ts
import { useState, useCallback } from 'react'
import { analyzeColors } from '../services/aiAnalyzer'
import type { AIAnalysisResult } from '../services/aiAnalyzer'

export function useAIAnalysis() {
  const [result, setResult] = useState<AIAnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Returns the result directly so callers don't read stale state
  const analyze = useCallback(async (
    hexColors: string[],
    imageBase64: string | null,
    apiKey: string
  ): Promise<AIAnalysisResult | null> => {
    if (!apiKey) { setError('OpenAI API key required. Add it in Settings.'); return null }
    setIsLoading(true)
    setError(null)
    try {
      const res = await analyzeColors(hexColors, imageBase64, apiKey)
      setResult(res)
      return res
    } catch (e) {
      setError((e as Error).message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { result, isLoading, error, analyze }
}
