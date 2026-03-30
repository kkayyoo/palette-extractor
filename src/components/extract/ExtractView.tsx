// src/components/extract/ExtractView.tsx
import { useState } from 'react'
import { ImageUploader } from './ImageUploader'
import { UrlInput } from './UrlInput'
import { DesignFormatPicker } from './DesignFormatPicker'
import { useColorExtraction } from '../../hooks/useColorExtraction'
import { useAIAnalysis } from '../../hooks/useAIAnalysis'
import { useApp } from '../../context/AppContext'
import type { ContentFormat, DesignFormat, ExtractedPalette, HexColor, PaletteColor } from '../../types'

const CONTENT_FORMATS: ContentFormat[] = [
  'website', 'mobile-app', 'dashboard', 'landing-page',
  'poster', 'social-media', 'presentation', 'ecommerce',
]

export function ExtractView() {
  const { addProject, setActiveProject, setView } = useApp()
  const extraction = useColorExtraction()
  const ai = useAIAnalysis()
  const [tab, setTab] = useState<'image' | 'url'>('image')
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai-api-key') ?? '')
  const [selectedFormat, setSelectedFormat] = useState<DesignFormat>('minimalist')
  const [contentFormat, setContentFormat] = useState<ContentFormat>('website')
  const [urlColors, setUrlColors] = useState<PaletteColor[]>([])
  const [isUrlLoading, setIsUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)

  async function handleFileSelected(file: File) {
    // extractFromFile returns the colors directly to avoid reading stale React state
    const extracted = await extraction.extractFromFile(file)
    if (extracted && extracted.length > 0) {
      const hexColors = extracted.map(c => c.hex)
      const analysisResult = await ai.analyze(hexColors, null, apiKey)
      if (analysisResult) setSelectedFormat(analysisResult.suggestedDesignFormats[0])
    }
  }

  async function handleUrlSubmit(url: string) {
    setIsUrlLoading(true)
    setUrlError(null)
    try {
      const res = await fetch(`/api/fetch-url?url=${encodeURIComponent(url)}`)
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      const data = await res.json()
      // data.colors is string[] of hex from CSS; convert to PaletteColor[]
      const hexColors: string[] = data.colors.slice(0, 8)
      const paletteColors: PaletteColor[] = hexColors
        .filter((h): h is HexColor => /^#[0-9a-fA-F]{3,8}$/.test(h))
        .map((hex, i) => ({ hex, role: i === 0 ? 'primary' : i === 1 ? 'secondary' : 'accent' as const }))
      setUrlColors(paletteColors)
      // Capture return value directly to avoid stale state reads
      const analysisResult = await ai.analyze(hexColors, null, apiKey)
      if (analysisResult) setSelectedFormat(analysisResult.suggestedDesignFormats[0])
    } catch (e) {
      setUrlError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsUrlLoading(false)
    }
  }

  function handleSave() {
    const colors = tab === 'image' ? extraction.colors : urlColors
    if (!ai.result || colors.length === 0) return
    const palette: ExtractedPalette = {
      id: crypto.randomUUID(),
      name: `Palette ${new Date().toLocaleDateString()}`,
      source: { type: tab, thumbnail: tab === 'image' ? extraction.thumbnail : '' },
      colors,
      keywords: ai.result.keywords,
      mood: ai.result.mood,
      suggestedDesignFormats: ai.result.suggestedDesignFormats,
      suggestedStyles: ai.result.suggestedStyles,
      designFormat: selectedFormat,
      contentFormat,
      createdAt: Date.now(),
    }
    const project = {
      id: crypto.randomUUID(),
      name: palette.name,
      type: 'palette' as const,
      palette,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    addProject(project)
    setActiveProject(project.id)
    setView('palette')
  }

  const hasPalette = (tab === 'image' ? extraction.colors : urlColors).length > 0
  const displayColors = tab === 'image' ? extraction.colors : urlColors

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Extract Colors</h1>

      {/* API Key input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-400 mb-1">OpenAI API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={e => {
            setApiKey(e.target.value)
            // Note: stored in localStorage for persistence across sessions.
            // Users should use a key with minimal permissions and understand the trade-off.
            localStorage.setItem('openai-api-key', e.target.value)
          }}
          placeholder="sk-..."
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-4">
        {(['image', 'url'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded text-sm font-medium ${tab === t ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'}`}
          >
            {t === 'image' ? 'Image Upload' : 'Website URL'}
          </button>
        ))}
      </div>

      {tab === 'image' ? (
        <ImageUploader
          isLoading={extraction.isLoading}
          error={extraction.error}
          onFileSelected={handleFileSelected}
        />
      ) : (
        <UrlInput onSubmit={handleUrlSubmit} isLoading={isUrlLoading} error={urlError} />
      )}

      {/* AI loading */}
      {ai.isLoading && <p className="mt-4 text-indigo-400 animate-pulse">Analyzing with AI…</p>}
      {ai.error && <p className="mt-4 text-red-400 text-sm">{ai.error}</p>}

      {/* Results */}
      {hasPalette && (
        <div className="mt-6 space-y-4">
          {/* Color swatches */}
          <div className="flex gap-2 flex-wrap">
            {displayColors.map((c) => (
              <div key={c.hex} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-lg border border-neutral-700" style={{ background: c.hex }} />
                <span className="text-xs text-neutral-500">{c.hex}</span>
                <span className="text-xs text-neutral-600">{c.role}</span>
              </div>
            ))}
          </div>

          {/* AI results */}
          {ai.result && (
            <>
              <div className="flex gap-2 flex-wrap">
                {ai.result.keywords.map(k => (
                  <span key={k} className="bg-neutral-800 text-neutral-300 rounded-full px-3 py-0.5 text-xs">{k}</span>
                ))}
                <span className="bg-indigo-900 text-indigo-300 rounded-full px-3 py-0.5 text-xs">mood: {ai.result.mood}</span>
              </div>

              <DesignFormatPicker
                suggestions={ai.result.suggestedDesignFormats}
                selected={selectedFormat}
                onChange={setSelectedFormat}
              />

              <div className="flex flex-col gap-1">
                <label htmlFor="content-format" className="text-sm font-medium text-neutral-300">Content Format</label>
                <select
                  id="content-format"
                  value={contentFormat}
                  onChange={e => setContentFormat(e.target.value as ContentFormat)}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-indigo-500"
                >
                  {CONTENT_FORMATS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSave}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-3 font-semibold"
              >
                Save Palette →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
