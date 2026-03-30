// src/components/extract/ImageUploader.tsx
import { useRef, type DragEvent } from 'react'
import type { PaletteColor } from '../../types'

interface Props {
  onExtract: (colors: PaletteColor[], thumbnail: string) => void
  isLoading?: boolean
  error?: string | null
  onFileSelected: (file: File) => void
}

export function ImageUploader({ onExtract: _onExtract, isLoading, error, onFileSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    onFileSelected(file)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      className="border-2 border-dashed border-neutral-700 rounded-xl p-12 text-center cursor-pointer hover:border-indigo-500 transition-colors"
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Upload image"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {isLoading ? (
        <p className="text-neutral-400">Extracting colors...</p>
      ) : (
        <>
          <div className="text-4xl mb-3" aria-hidden="true">🖼</div>
          <p className="text-neutral-300 font-medium">Drop an image or click to upload</p>
          <p className="text-neutral-600 text-sm mt-1">JPEG, PNG, GIF, WEBP</p>
        </>
      )}
      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
    </div>
  )
}
