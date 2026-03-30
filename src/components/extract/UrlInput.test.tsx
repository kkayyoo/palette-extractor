import { render, screen, fireEvent } from '@testing-library/react'
import { UrlInput } from './UrlInput'

it('renders url text input and submit button', () => {
  render(<UrlInput onSubmit={() => {}} isLoading={false} />)
  expect(screen.getByPlaceholderText(/https/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /extract/i })).toBeInTheDocument()
})

it('calls onSubmit with entered url', () => {
  const onSubmit = vi.fn()
  render(<UrlInput onSubmit={onSubmit} isLoading={false} />)
  fireEvent.change(screen.getByPlaceholderText(/https/i), { target: { value: 'https://example.com' } })
  fireEvent.click(screen.getByRole('button', { name: /extract/i }))
  expect(onSubmit).toHaveBeenCalledWith('https://example.com')
})

it('does not call onSubmit with empty url', () => {
  const onSubmit = vi.fn()
  render(<UrlInput onSubmit={onSubmit} isLoading={false} />)
  fireEvent.click(screen.getByRole('button', { name: /extract/i }))
  expect(onSubmit).not.toHaveBeenCalled()
})
