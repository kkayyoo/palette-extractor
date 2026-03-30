// src/components/extract/ImageUploader.test.tsx
import { render, screen } from '@testing-library/react'
import { ImageUploader } from './ImageUploader'

it('renders a file input', () => {
  render(<ImageUploader onExtract={() => {}} onFileSelected={() => {}} />)
  expect(screen.getByLabelText(/upload/i)).toBeInTheDocument()
})
