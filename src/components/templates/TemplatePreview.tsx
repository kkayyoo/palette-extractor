// src/components/templates/TemplatePreview.tsx
interface Props { html: string; css: string }

export function TemplatePreview({ html, css }: Props) {
  const srcDoc = `<!DOCTYPE html><html><head><style>
    body { margin: 0; padding: 2rem; font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #1a1a2e; }
    ${css}
  </style></head><body>${html}</body></html>`

  return (
    <iframe
      title="Template preview"
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      className="w-full h-64 rounded-xl border border-neutral-700 bg-neutral-900"
    />
  )
}
