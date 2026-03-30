// src/components/export/ExportPanel.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
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

it('calls clipboard and shows Copied! after successful copy', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    writable: true,
    configurable: true,
  })
  render(<ExportPanel code="body {}" />)
  const btn = screen.getByRole('button', { name: /copy/i })
  fireEvent.click(btn)
  await screen.findByText('Copied!')
  expect(writeText).toHaveBeenCalledWith('body {}')
})

it('shows Failed! when clipboard write rejects', async () => {
  const writeText = vi.fn().mockRejectedValue(new Error('permission denied'))
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    writable: true,
    configurable: true,
  })
  render(<ExportPanel code="body {}" />)
  const btn = screen.getByRole('button', { name: /copy/i })
  fireEvent.click(btn)
  await screen.findByText('Failed!')
})
