// src/components/palette/ColorEditor.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ColorEditor } from './ColorEditor'
import type { PaletteColor } from '../../types'

const colors: PaletteColor[] = [
  { hex: '#ff0000', role: 'primary' },
  { hex: '#0000ff', role: 'secondary' },
]

it('calls onChange with swapped roles when a role is changed', () => {
  const onChange = vi.fn()
  render(<ColorEditor colors={colors} onChange={onChange} />)
  // Change first color's role to 'secondary' — should swap with second color
  const selects = screen.getAllByRole('combobox')
  fireEvent.change(selects[0], { target: { value: 'secondary' } })
  expect(onChange).toHaveBeenCalledWith([
    { hex: '#ff0000', role: 'secondary' },
    { hex: '#0000ff', role: 'primary' }, // swapped
  ])
})

it('handles duplicate roles — only first match gets swapped', () => {
  const onChange = vi.fn()
  const dupeColors: PaletteColor[] = [
    { hex: '#ff0000', role: 'primary' },
    { hex: '#00ff00', role: 'accent' },
    { hex: '#0000ff', role: 'accent' }, // duplicate role
  ]
  render(<ColorEditor colors={dupeColors} onChange={onChange} />)
  const selects = screen.getAllByRole('combobox')
  // Change first color to 'accent' — only second color should be swapped (first match)
  fireEvent.change(selects[0], { target: { value: 'accent' } })
  const result = onChange.mock.calls[0][0]
  expect(result[0].role).toBe('accent')
  expect(result[1].role).toBe('primary') // first match swapped
  expect(result[2].role).toBe('accent')  // not swapped (second match)
})
