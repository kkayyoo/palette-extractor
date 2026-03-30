// src/components/templates/TemplateGrid.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { TemplateGrid } from './TemplateGrid'
import { buttonTemplates } from '../../templates/buttons'

it('renders a button for each template', () => {
  render(<TemplateGrid templates={buttonTemplates} selected={null} onSelect={() => {}} />)
  const buttons = screen.getAllByRole('button')
  expect(buttons.length).toBe(buttonTemplates.length)
})

it('calls onSelect when template clicked', () => {
  const onSelect = vi.fn()
  render(<TemplateGrid templates={buttonTemplates} selected={null} onSelect={onSelect} />)
  fireEvent.click(screen.getAllByRole('button')[0])
  expect(onSelect).toHaveBeenCalledWith(buttonTemplates[0])
})
