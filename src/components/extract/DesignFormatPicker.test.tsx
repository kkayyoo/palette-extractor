// src/components/extract/DesignFormatPicker.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { DesignFormatPicker } from './DesignFormatPicker'
import type { DesignFormat } from '../../types'

const suggestions: [DesignFormat, DesignFormat] = ['minimalist', 'glassmorphism']

it('renders both suggested formats as options', () => {
  render(
    <DesignFormatPicker
      suggestions={suggestions}
      selected="minimalist"
      onChange={() => {}}
    />
  )
  expect(screen.getByRole('option', { name: /minimalist/i })).toBeInTheDocument()
  expect(screen.getByRole('option', { name: /glassmorphism/i })).toBeInTheDocument()
})

it('calls onChange when selection changes', () => {
  const onChange = vi.fn()
  render(
    <DesignFormatPicker suggestions={suggestions} selected="minimalist" onChange={onChange} />
  )
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'glassmorphism' } })
  expect(onChange).toHaveBeenCalledWith('glassmorphism')
})
