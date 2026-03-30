import { useState } from 'react'

interface Props {
  onSubmit: (url: string) => void
  isLoading: boolean
  error?: string | null
}

export function UrlInput({ onSubmit, isLoading, error }: Props) {
  const [url, setUrl] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="url"
          aria-label="Website URL"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com"
          disabled={isLoading}
          className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg px-5 py-2 font-medium"
        >
          {isLoading ? 'Extracting…' : 'Extract'}
        </button>
      </form>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  )
}
