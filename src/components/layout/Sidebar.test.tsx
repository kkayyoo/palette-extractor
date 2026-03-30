// src/components/layout/Sidebar.test.tsx
import { render, screen } from '@testing-library/react'
import { AppProvider } from '../../context/AppContext'
import { Sidebar } from './Sidebar'

function wrap(ui: React.ReactNode) {
  return render(<AppProvider>{ui}</AppProvider>)
}

it('renders Projects heading', () => {
  wrap(<Sidebar />)
  expect(screen.getByText(/Projects/i)).toBeInTheDocument()
})

it('renders + New button', () => {
  wrap(<Sidebar />)
  expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument()
})
