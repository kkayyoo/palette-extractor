// src/App.tsx
import { AppProvider } from './context/AppContext'
import { Sidebar } from './components/layout/Sidebar'
import { Toolbar } from './components/layout/Toolbar'
import { Canvas } from './components/layout/Canvas'

export default function App() {
  return (
    <AppProvider>
      <div className="flex h-screen overflow-hidden bg-neutral-950 text-neutral-100">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Toolbar />
          <Canvas />
        </div>
      </div>
    </AppProvider>
  )
}
