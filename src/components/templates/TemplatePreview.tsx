// src/components/templates/TemplatePreview.tsx
import { useEffect, useRef } from 'react'

interface Props { html: string; css: string }

export function TemplatePreview({ html, css }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const doc = iframe.contentDocument
    if (!doc) return
    doc.open()
    doc.write(`<!DOCTYPE html><html><head><style>
      body { margin: 0; padding: 2rem; font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #1a1a2e; }
      ${css}
    </style></head><body>${html}</body></html>`)
    doc.close()
  }, [html, css])

  return (
    <iframe
      ref={iframeRef}
      title="Template preview"
      sandbox="allow-same-origin"
      className="w-full h-64 rounded-xl border border-neutral-700 bg-neutral-900"
    />
  )
}
