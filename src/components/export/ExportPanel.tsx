// src/components/export/ExportPanel.tsx
import { useState, useRef, useEffect } from 'react'

interface Props { code: string }

export function ExportPanel({ code }: Props) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setCopyError(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopyError(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopyError(false), 2000)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-400">HTML + CSS</span>
        <button
          onClick={handleCopy}
          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded px-3 py-1.5 text-sm font-medium transition-colors"
          aria-label="Copy to clipboard"
        >
          {copyError ? 'Failed!' : copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre
        role="region"
        aria-label="Generated code"
        className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-xs text-neutral-300 overflow-auto max-h-[60vh] font-mono leading-relaxed whitespace-pre-wrap"
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}
