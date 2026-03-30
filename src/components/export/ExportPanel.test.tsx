// src/components/export/ExportPanel.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ExportPanel } from './ExportPanel'

it('renders code in a pre/code block', () => {
  render(<ExportPanel code="/* palette */\n:root { --primary: #f00; }" />)
  expect(screen.getByRole('region', { name: /code/i })).toBeInTheDocument()
  expect(screen.getByText(/--primary/)).toBeInTheDocument()
})

it('renders copy button', () => {
  render(<ExportPanel code="body {}" />)
  expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
})
