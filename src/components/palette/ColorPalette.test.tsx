import { render, screen } from '@testing-library/react'
import { ColorPalette } from './ColorPalette'
import type { PaletteColor } from '../../types'

const colors: PaletteColor[] = [
  { hex: '#ff5500', role: 'primary' },
  { hex: '#ffffff', role: 'background' },
]

it('renders all color swatches', () => {
  render(<ColorPalette colors={colors} />)
  expect(screen.getAllByRole('listitem')).toHaveLength(2)
})

it('displays hex values', () => {
  render(<ColorPalette colors={colors} />)
  expect(screen.getByText('#ff5500')).toBeInTheDocument()
})
