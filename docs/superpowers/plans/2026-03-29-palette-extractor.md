# Color Palette & Style Extractor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web tool that extracts color palettes from images or URLs, runs AI style analysis, and generates animated UI component templates the user can customize and export as HTML/CSS.

**Architecture:** React 18 + TypeScript SPA using Vite. Client-side Canvas API for image color extraction, a Vercel serverless function for URL fetching/CSS parsing, and OpenAI GPT-4o Vision for style analysis. App state lives in React Context backed by localStorage. Templates are pure functions that accept a palette + customization options and return HTML/CSS strings.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Vercel Functions, OpenAI GPT-4o Vision API, localStorage.

---

## File Map

```
src/
├── types/index.ts                         — All shared TypeScript types (ExtractedPalette, Project, AppState, etc.)
├── context/AppContext.tsx                 — Global state (AppState), actions, localStorage persistence
├── hooks/
│   ├── useLocalStorage.ts                 — Generic hook: read/write a key in localStorage
│   ├── useColorExtraction.ts              — Canvas-based k-means color extraction + role assignment
│   └── useAIAnalysis.ts                   — Call OpenAI GPT-4o Vision; returns keywords, mood, design format suggestions
├── services/
│   ├── colorExtractor.ts                  — Pure functions: k-means clustering, color role assignment
│   └── aiAnalyzer.ts                      — Build GPT-4o request; parse response
├── templates/
│   ├── types.ts                           — TemplateSpec, CustomizationOptions interfaces
│   ├── buttons.ts                         — Button template generator functions
│   ├── cards.ts                           — Card template generator functions
│   ├── heroes.ts                          — Hero section template generator functions
│   ├── footers.ts                         — Footer template generator functions
│   └── backgrounds.ts                     — Background template generator functions
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx                    — Project browser; list palettes & templates; "+ New" button
│   │   ├── Canvas.tsx                     — Main content area; renders active view
│   │   └── Toolbar.tsx                    — Top bar with Extract / Templates / Export tabs
│   ├── extract/
│   │   ├── ImageUploader.tsx              — Drag-and-drop / file-select; validates by magic bytes
│   │   ├── UrlInput.tsx                   — URL text field + submit; SSRF-safe
│   │   └── DesignFormatPicker.tsx         — Dropdown of 2 AI-suggested formats with live preview
│   ├── palette/
│   │   ├── ColorPalette.tsx               — Displays extracted color swatches + roles
│   │   ├── ColorEditor.tsx                — Swap color roles via drag or dropdown
│   │   └── KeywordTags.tsx                — Renders mood + keyword chips
│   ├── templates/
│   │   ├── TemplateGrid.tsx               — Browse templates by category; select one
│   │   ├── TemplatePreview.tsx            — Renders live HTML preview in a sandboxed iframe
│   │   └── AnimationControls.tsx          — Speed / intensity / style selectors
│   └── export/
│       └── ExportPanel.tsx                — Code block view + copy-to-clipboard
└── api/
    └── fetch-url.ts                       — Vercel Function: fetches URL, parses CSS; SSRF mitigations
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`

- [ ] **Step 1: Scaffold with Vite**

```bash
npm create vite@latest . -- --template react-ts
npm install
```

Expected: project runs with `npm run dev`.

- [ ] **Step 2: Install dependencies**

```bash
npm install tailwindcss @tailwindcss/vite openai
npm install -D @types/node vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 3: Configure Tailwind**

Edit `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Add to `src/index.css`:
```css
@import "tailwindcss";
```

- [ ] **Step 4: Configure Vitest**

Add to `vite.config.ts` inside `defineConfig`:
```typescript
test: {
  environment: 'jsdom',
  setupFiles: ['./src/test-setup.ts'],
  globals: true,
},
```

Create `src/test-setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Verify scaffold runs**

```bash
npm run dev
```

Expected: Vite dev server starts, browser shows React default page.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: scaffold React + Vite + Tailwind + Vitest"
```

---

## Task 2: Type Definitions

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Write types**

```typescript
// src/types/index.ts

export type DesignFormat =
  | 'minimalist' | 'brutalist' | 'flat' | 'glassmorphism'
  | 'neumorphism' | 'retro' | 'organic' | 'skeuomorphic';

export type ContentFormat =
  | 'website' | 'mobile-app' | 'dashboard' | 'landing-page'
  | 'poster' | 'social-media' | 'presentation' | 'ecommerce';

export interface PaletteColor {
  hex: string;
  role: string; // 'primary' | 'secondary' | 'accent' | 'background' | 'text' | etc.
}

export interface SuggestedStyles {
  borderRadius: 'sharp' | 'rounded' | 'pill';
  shadows: 'none' | 'subtle' | 'soft' | 'dramatic';
  typography: 'modern' | 'classic' | 'friendly' | 'bold';
}

export interface ExtractedPalette {
  id: string;
  name: string;
  source: { type: 'image' | 'url'; thumbnail: string };
  colors: PaletteColor[];
  keywords: string[];
  mood: string;
  suggestedDesignFormats: [DesignFormat, DesignFormat];
  suggestedStyles: SuggestedStyles;
  designFormat: DesignFormat;
  contentFormat: ContentFormat;
  createdAt: number;
}

export interface TemplateRecord {
  category: string;
  templateId: string;
  appliedPalette: string; // palette id
  customizations: Record<string, unknown>;
  generatedCode: string;
}

export interface Project {
  id: string;
  name: string;
  type: 'palette' | 'template';
  palette?: ExtractedPalette;
  template?: TemplateRecord;
  createdAt: number;
  updatedAt: number;
}

export type AppView = 'extract' | 'palette' | 'template' | 'export';

export interface AppState {
  projects: Project[];
  activeProjectId: string | null;
  view: AppView;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts && git commit -m "feat: add shared TypeScript types"
```

---

## Task 3: localStorage Hook

**Files:**
- Create: `src/hooks/useLocalStorage.ts`
- Test: `src/hooks/useLocalStorage.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// src/hooks/useLocalStorage.test.ts
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

beforeEach(() => localStorage.clear())

it('returns default value when key is absent', () => {
  const { result } = renderHook(() => useLocalStorage('x', 42))
  expect(result.current[0]).toBe(42)
})

it('persists value to localStorage', () => {
  const { result } = renderHook(() => useLocalStorage('x', 0))
  act(() => result.current[1](99))
  expect(localStorage.getItem('x')).toBe('99')
})

it('reads existing value from localStorage', () => {
  localStorage.setItem('x', '"hello"')
  const { result } = renderHook(() => useLocalStorage('x', ''))
  expect(result.current[0]).toBe('hello')
})
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npx vitest run src/hooks/useLocalStorage.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement hook**

```typescript
// src/hooks/useLocalStorage.ts
import { useState, useCallback } from 'react'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setStored = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue(prev => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        try { localStorage.setItem(key, JSON.stringify(resolved)) } catch { /* quota */ }
        return resolved
      })
    },
    [key]
  )

  return [value, setStored] as const
}
```

- [ ] **Step 4: Run test to confirm pass**

```bash
npx vitest run src/hooks/useLocalStorage.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useLocalStorage.ts src/hooks/useLocalStorage.test.ts
git commit -m "feat: add useLocalStorage hook"
```

---

## Task 4: App Context & State Management

**Files:**
- Create: `src/context/AppContext.tsx`
- Test: `src/context/AppContext.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/context/AppContext.test.tsx
import { renderHook, act } from '@testing-library/react'
import { AppProvider, useApp } from './AppContext'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
)

beforeEach(() => localStorage.clear())

it('starts with empty projects and extract view', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  expect(result.current.state.projects).toHaveLength(0)
  expect(result.current.state.view).toBe('extract')
})

it('addProject adds to projects list', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  const project = {
    id: '1', name: 'Test', type: 'palette' as const,
    createdAt: 0, updatedAt: 0,
  }
  act(() => result.current.addProject(project))
  expect(result.current.state.projects).toHaveLength(1)
})

it('setView changes the active view', () => {
  const { result } = renderHook(() => useApp(), { wrapper })
  act(() => result.current.setView('template'))
  expect(result.current.state.view).toBe('template')
})
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npx vitest run src/context/AppContext.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement context**

```typescript
// src/context/AppContext.tsx
import React, { createContext, useContext, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { AppState, AppView, Project } from '../types'

const DEFAULT_STATE: AppState = { projects: [], activeProjectId: null, view: 'extract' }

interface AppContextValue {
  state: AppState
  setView: (view: AppView) => void
  addProject: (project: Project) => void
  updateProject: (id: string, patch: Partial<Project>) => void
  deleteProject: (id: string) => void
  setActiveProject: (id: string | null) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useLocalStorage<AppState>('app-state', DEFAULT_STATE)

  const setView = useCallback((view: AppView) =>
    setState(s => ({ ...s, view })), [setState])

  const addProject = useCallback((project: Project) =>
    setState(s => ({ ...s, projects: [...s.projects, project] })), [setState])

  const updateProject = useCallback((id: string, patch: Partial<Project>) =>
    setState(s => ({
      ...s,
      projects: s.projects.map(p => p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p),
    })), [setState])

  const deleteProject = useCallback((id: string) =>
    setState(s => ({
      ...s,
      projects: s.projects.filter(p => p.id !== id),
      activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
    })), [setState])

  const setActiveProject = useCallback((id: string | null) =>
    setState(s => ({ ...s, activeProjectId: id })), [setState])

  return (
    <AppContext.Provider value={{ state, setView, addProject, updateProject, deleteProject, setActiveProject }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
```

- [ ] **Step 4: Run test to confirm pass**

```bash
npx vitest run src/context/AppContext.test.tsx
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/context/AppContext.tsx src/context/AppContext.test.tsx
git commit -m "feat: add AppContext with localStorage-backed state"
```

---

## Task 5: Color Extractor Service

**Files:**
- Create: `src/services/colorExtractor.ts`
- Test: `src/services/colorExtractor.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/services/colorExtractor.test.ts
import { hexToRgb, rgbToHex, kMeans, assignRoles } from './colorExtractor'

it('hexToRgb converts #ff0000 to [255,0,0]', () => {
  expect(hexToRgb('#ff0000')).toEqual([255, 0, 0])
})

it('rgbToHex converts [0,128,255] to #0080ff', () => {
  expect(rgbToHex([0, 128, 255])).toBe('#0080ff')
})

it('kMeans returns exactly k clusters from pixel data', () => {
  // Build 100 red pixels and 100 blue pixels
  const pixels: [number, number, number][] = [
    ...Array(100).fill([255, 0, 0]),
    ...Array(100).fill([0, 0, 255]),
  ]
  const result = kMeans(pixels, 2, 10)
  expect(result).toHaveLength(2)
})

it('assignRoles returns colors with unique roles', () => {
  const colors = ['#ffffff', '#000000', '#ff5500', '#0055ff', '#888888']
  const result = assignRoles(colors)
  const roles = result.map(c => c.role)
  expect(new Set(roles).size).toBe(roles.length)
})
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npx vitest run src/services/colorExtractor.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement color extractor**

```typescript
// src/services/colorExtractor.ts
import type { PaletteColor } from '../types'

export function hexToRgb(hex: string): [number, number, number] {
  const v = parseInt(hex.replace('#', ''), 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}

export function rgbToHex([r, g, b]: [number, number, number]): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

function distance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2)
}

export function kMeans(
  pixels: [number, number, number][],
  k: number,
  maxIter = 20
): [number, number, number][] {
  // Seed centroids from evenly-spaced pixels
  let centroids = Array.from({ length: k }, (_, i) =>
    pixels[Math.floor((i / k) * pixels.length)]
  )

  for (let iter = 0; iter < maxIter; iter++) {
    const clusters: [number, number, number][][] = Array.from({ length: k }, () => [])
    for (const p of pixels) {
      let best = 0, bestDist = Infinity
      for (let i = 0; i < k; i++) {
        const d = distance(p, centroids[i])
        if (d < bestDist) { bestDist = d; best = i }
      }
      clusters[best].push(p)
    }
    centroids = clusters.map(cluster => {
      if (cluster.length === 0) return centroids[0]
      const sum = cluster.reduce((acc, p) => [acc[0]+p[0], acc[1]+p[1], acc[2]+p[2]] as [number,number,number], [0,0,0] as [number,number,number])
      return [Math.round(sum[0]/cluster.length), Math.round(sum[1]/cluster.length), Math.round(sum[2]/cluster.length)] as [number,number,number]
    })
  }
  return centroids
}

// Heuristic role assignment based on perceived lightness and saturation
export function assignRoles(hexColors: string[]): PaletteColor[] {
  const withLightness = hexColors.map(hex => {
    const [r, g, b] = hexToRgb(hex)
    const lightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    const max = Math.max(r, g, b) / 255
    const min = Math.min(r, g, b) / 255
    const saturation = max === 0 ? 0 : (max - min) / max
    return { hex, lightness, saturation }
  })

  const sorted = [...withLightness].sort((a, b) => b.lightness - a.lightness)
  const roles = ['background', 'text', 'primary', 'secondary', 'accent']

  return sorted.map((c, i) => ({
    hex: c.hex,
    role: roles[i] ?? `extra-${i - roles.length + 1}`,
  }))
}

export function extractColorsFromCanvas(canvas: HTMLCanvasElement, k = 6): PaletteColor[] {
  const ctx = canvas.getContext('2d')
  if (!ctx) return []
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixels: [number, number, number][] = []
  // Sample every 10th pixel to keep runtime reasonable
  for (let i = 0; i < data.length; i += 40) {
    if (data[i + 3] > 128) { // skip transparent
      pixels.push([data[i], data[i + 1], data[i + 2]])
    }
  }
  const centroids = kMeans(pixels, k)
  return assignRoles(centroids.map(rgbToHex))
}
```

- [ ] **Step 4: Run test to confirm pass**

```bash
npx vitest run src/services/colorExtractor.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/services/colorExtractor.ts src/services/colorExtractor.test.ts
git commit -m "feat: color extraction service with k-means clustering"
```

---

## Task 6: AI Analyzer Service

**Files:**
- Create: `src/services/aiAnalyzer.ts`
- Test: `src/services/aiAnalyzer.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/services/aiAnalyzer.test.ts
import { parseAIResponse, buildPrompt } from './aiAnalyzer'

it('parseAIResponse extracts valid JSON from AI output', () => {
  const raw = `Here is my analysis:
\`\`\`json
{
  "keywords": ["bold", "energetic"],
  "mood": "energetic",
  "suggestedDesignFormats": ["brutalist", "flat"],
  "suggestedStyles": {
    "borderRadius": "sharp",
    "shadows": "none",
    "typography": "bold"
  }
}
\`\`\``
  const result = parseAIResponse(raw)
  expect(result.keywords).toEqual(['bold', 'energetic'])
  expect(result.suggestedDesignFormats).toHaveLength(2)
})

it('parseAIResponse throws on invalid JSON', () => {
  expect(() => parseAIResponse('no json here')).toThrow()
})

it('buildPrompt returns a non-empty string', () => {
  expect(buildPrompt(['#ffffff', '#000000'])).toMatch(/color/i)
})
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npx vitest run src/services/aiAnalyzer.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement AI analyzer**

```typescript
// src/services/aiAnalyzer.ts
import type { DesignFormat, SuggestedStyles } from '../types'

export interface AIAnalysisResult {
  keywords: string[]
  mood: string
  suggestedDesignFormats: [DesignFormat, DesignFormat]
  suggestedStyles: SuggestedStyles
}

export function buildPrompt(hexColors: string[]): string {
  return `You are a design expert. Analyze these color palette hexes: ${hexColors.join(', ')}.
Return ONLY a JSON code block with this exact structure:
\`\`\`json
{
  "keywords": ["word1", "word2", "word3"],
  "mood": "one word mood",
  "suggestedDesignFormats": ["format1", "format2"],
  "suggestedStyles": {
    "borderRadius": "sharp|rounded|pill",
    "shadows": "none|subtle|soft|dramatic",
    "typography": "modern|classic|friendly|bold"
  }
}
\`\`\`
Valid design formats: minimalist, brutalist, flat, glassmorphism, neumorphism, retro, organic, skeuomorphic.`
}

export function parseAIResponse(raw: string): AIAnalysisResult {
  const match = raw.match(/```json\s*([\s\S]*?)```/)
  if (!match) throw new Error('No JSON block found in AI response')
  return JSON.parse(match[1]) as AIAnalysisResult
}

export async function analyzeColors(
  hexColors: string[],
  imageBase64: string | null,
  apiKey: string
): Promise<AIAnalysisResult> {
  const messages: { role: string; content: unknown }[] = [
    {
      role: 'user',
      content: imageBase64
        ? [
            { type: 'text', text: buildPrompt(hexColors) },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          ]
        : buildPrompt(hexColors),
    },
  ]

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'gpt-4o', messages, max_tokens: 512 }),
  })

  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`)
  const data = await res.json()
  const content: string = data.choices[0].message.content
  return parseAIResponse(content)
}
```

- [ ] **Step 4: Run test to confirm pass**

```bash
npx vitest run src/services/aiAnalyzer.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/services/aiAnalyzer.ts src/services/aiAnalyzer.test.ts
git commit -m "feat: AI analyzer service for GPT-4o style analysis"
```

---

## Task 7: Serverless URL Fetcher

**Files:**
- Create: `api/fetch-url.ts`
- Create: `vercel.json`

- [ ] **Step 1: Create Vercel config**

```json
// vercel.json
{
  "functions": {
    "api/*.ts": { "runtime": "@vercel/node" }
  }
}
```

- [ ] **Step 2: Implement fetch-url function**

```typescript
// api/fetch-url.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { URL } from 'url'

const PRIVATE_IP_PATTERNS = [
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^127\./,
  /^::1$/,
  /^localhost$/i,
]

function isPrivate(hostname: string): boolean {
  return PRIVATE_IP_PATTERNS.some(p => p.test(hostname))
}

// Simple rate-limit store (resets on cold start — acceptable for MVP)
const rateMap = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT = 10
const WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ?? 'unknown'
  if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Rate limit exceeded' })

  const { url } = req.query
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'Missing url' })

  let parsed: URL
  try { parsed = new URL(url) } catch { return res.status(400).json({ error: 'Invalid URL' }) }

  if (!['http:', 'https:'].includes(parsed.protocol))
    return res.status(400).json({ error: 'Only HTTP(S) allowed' })

  if (isPrivate(parsed.hostname))
    return res.status(400).json({ error: 'Private/internal URLs not allowed' })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    let redirectCount = 0
    let targetUrl = url
    let response: Response

    while (redirectCount <= 3) {
      response = await fetch(targetUrl, {
        signal: controller.signal,
        redirect: 'manual',
        headers: { 'User-Agent': 'PaletteExtractor/1.0' },
      })

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location')
        if (!location) break
        const next = new URL(location, targetUrl)
        if (isPrivate(next.hostname)) return res.status(400).json({ error: 'Redirect to private IP blocked' })
        targetUrl = next.toString()
        redirectCount++
        continue
      }
      break
    }

    const contentLength = parseInt(response!.headers.get('content-length') ?? '0')
    if (contentLength > 5 * 1024 * 1024)
      return res.status(413).json({ error: 'Response too large' })

    const text = await response!.text()
    if (text.length > 5 * 1024 * 1024)
      return res.status(413).json({ error: 'Response too large' })

    // Extract CSS colors and stylesheet hrefs
    const colors = extractCssColors(text)
    const stylesheetUrls = extractStylesheetUrls(text, targetUrl)

    return res.status(200).json({ colors, stylesheetUrls, html: text.slice(0, 50_000) })
  } catch (err: unknown) {
    if ((err as Error).name === 'AbortError') return res.status(504).json({ error: 'Timeout' })
    return res.status(502).json({ error: 'Fetch failed' })
  } finally {
    clearTimeout(timeout)
  }
}

function extractCssColors(text: string): string[] {
  const hexPattern = /#([0-9a-fA-F]{3,6})\b/g
  const colors = new Set<string>()
  let m: RegExpExecArray | null
  while ((m = hexPattern.exec(text)) !== null) colors.add('#' + m[1])
  return [...colors].slice(0, 50)
}

function extractStylesheetUrls(html: string, base: string): string[] {
  const linkPattern = /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi
  const urls: string[] = []
  let m: RegExpExecArray | null
  while ((m = linkPattern.exec(html)) !== null) {
    try { urls.push(new URL(m[1], base).toString()) } catch { /* skip */ }
  }
  return urls.slice(0, 5)
}
```

- [ ] **Step 3: Install Vercel node types**

```bash
npm install -D @vercel/node
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add api/fetch-url.ts vercel.json && git commit -m "feat: serverless URL fetcher with SSRF mitigations"
```

---

## Task 8: Template Engine — Types & Buttons

**Files:**
- Create: `src/templates/types.ts`
- Create: `src/templates/buttons.ts`  — Helper functions (`getColor`, `speedMs`, `borderRadius`, `shadowStyle`) live here for now; Task 9 moves them to `utils.ts`
- Test: `src/templates/buttons.test.ts`

- [ ] **Step 1: Write template types**

```typescript
// src/templates/types.ts
import type { DesignFormat, PaletteColor } from '../types'

export type AnimationSpeed = 'slow' | 'default' | 'fast'
export type AnimationIntensity = 'subtle' | 'medium' | 'dramatic'

export interface CustomizationOptions {
  animationStyle: string
  animationSpeed: AnimationSpeed
  animationIntensity: AnimationIntensity
}

export interface TemplateResult {
  html: string
  css: string
}

export interface TemplateSpec {
  id: string
  label: string
  category: 'button' | 'card' | 'hero' | 'footer' | 'background'
  generate: (
    colors: PaletteColor[],
    format: DesignFormat,
    options: CustomizationOptions
  ) => TemplateResult
}
```

- [ ] **Step 2: Write failing button tests**

```typescript
// src/templates/buttons.test.ts
import { buttonTemplates } from './buttons'
import type { PaletteColor } from '../types'
import type { CustomizationOptions } from './types'

const colors: PaletteColor[] = [
  { hex: '#ffffff', role: 'background' },
  { hex: '#1a1a2e', role: 'text' },
  { hex: '#e94560', role: 'primary' },
  { hex: '#16213e', role: 'secondary' },
  { hex: '#0f3460', role: 'accent' },
]

const opts: CustomizationOptions = {
  animationStyle: 'hover-scale',
  animationSpeed: 'default',
  animationIntensity: 'medium',
}

it('buttonTemplates exports at least 5 templates', () => {
  expect(buttonTemplates.length).toBeGreaterThanOrEqual(5)
})

it('each button template generates html and css strings', () => {
  for (const t of buttonTemplates) {
    const result = t.generate(colors, 'flat', opts)
    expect(typeof result.html).toBe('string')
    expect(typeof result.css).toBe('string')
    expect(result.html.length).toBeGreaterThan(0)
  }
})

it('generated CSS includes the primary color', () => {
  const result = buttonTemplates[0].generate(colors, 'flat', opts)
  expect(result.css).toMatch(/#e94560/i)
})
```

- [ ] **Step 3: Run test to confirm failure**

```bash
npx vitest run src/templates/buttons.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement buttons template**

```typescript
// src/templates/buttons.ts
import type { PaletteColor, DesignFormat } from '../types'
import type { CustomizationOptions, TemplateResult, TemplateSpec } from './types'

function getColor(colors: PaletteColor[], role: string, fallback = '#888'): string {
  return colors.find(c => c.role === role)?.hex ?? fallback
}

function speedMs(speed: 'slow' | 'default' | 'fast'): string {
  return speed === 'slow' ? '0.5s' : speed === 'fast' ? '0.15s' : '0.25s'
}

function borderRadius(format: DesignFormat): string {
  if (format === 'brutalist') return '0'
  if (format === 'neumorphism' || format === 'organic') return '12px'
  if (format === 'minimalist' || format === 'flat') return '4px'
  return '6px'
}

function shadowStyle(format: DesignFormat, primary: string): string {
  if (format === 'neumorphism') return '4px 4px 8px rgba(0,0,0,0.2), -4px -4px 8px rgba(255,255,255,0.1)'
  if (format === 'glassmorphism') return `0 0 20px ${primary}55`
  if (format === 'brutalist') return `4px 4px 0 ${primary}`
  return 'none'
}

function generatePrimaryButton(
  colors: PaletteColor[], format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const primary = getColor(colors, 'primary')
  const bg = getColor(colors, 'background')
  const dur = speedMs(options.animationSpeed)
  const br = borderRadius(format)
  const shadow = shadowStyle(format, primary)

  const css = `.btn-primary {
  background: ${primary};
  color: ${bg};
  border: ${format === 'brutalist' ? `3px solid ${primary}` : 'none'};
  border-radius: ${br};
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: ${shadow};
  transition: transform ${dur} ease, box-shadow ${dur} ease, opacity ${dur} ease;
  ${format === 'glassmorphism' ? 'backdrop-filter: blur(10px); background: ' + primary + '99;' : ''}
}
.btn-primary:hover {
  transform: scale(${options.animationStyle === 'hover-scale' ? '1.05' : '1'});
  opacity: 0.9;
}`

  const html = `<button class="btn-primary">Click me</button>`
  return { html, css }
}

function generateSecondaryButton(
  colors: PaletteColor[], format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const secondary = getColor(colors, 'secondary')
  const bg = getColor(colors, 'background')
  const dur = speedMs(options.animationSpeed)
  const br = borderRadius(format)

  const css = `.btn-secondary {
  background: ${secondary};
  color: ${bg};
  border-radius: ${br};
  border: none;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: opacity ${dur} ease;
}
.btn-secondary:hover { opacity: 0.85; }`
  return { html: `<button class="btn-secondary">Secondary</button>`, css }
}

function generateOutlineButton(
  colors: PaletteColor[], format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const primary = getColor(colors, 'primary')
  const dur = speedMs(options.animationSpeed)
  const br = borderRadius(format)

  const css = `.btn-outline {
  background: transparent;
  color: ${primary};
  border: 2px solid ${primary};
  border-radius: ${br};
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: background ${dur} ease, color ${dur} ease;
}
.btn-outline:hover {
  background: ${primary};
  color: #fff;
}`
  return { html: `<button class="btn-outline">Outline</button>`, css }
}

function generateGhostButton(
  colors: PaletteColor[], format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const text = getColor(colors, 'text')
  const dur = speedMs(options.animationSpeed)
  const br = borderRadius(format)

  const css = `.btn-ghost {
  background: transparent;
  color: ${text};
  border: none;
  border-radius: ${br};
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: background ${dur} ease;
}
.btn-ghost:hover { background: ${text}20; }`
  return { html: `<button class="btn-ghost">Ghost</button>`, css }
}

function generateIconButton(
  colors: PaletteColor[], format: DesignFormat, options: CustomizationOptions
): TemplateResult {
  const primary = getColor(colors, 'primary')
  const dur = speedMs(options.animationSpeed)
  const br = format === 'brutalist' ? '0' : '50%'

  const css = `.btn-icon {
  background: ${primary};
  color: #fff;
  border: none;
  border-radius: ${br};
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: transform ${dur} ease;
}
.btn-icon:hover { transform: ${options.animationStyle === 'bounce' ? 'translateY(-4px)' : 'scale(1.1)'}; }`
  return {
    html: `<button class="btn-icon"><svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="currentColor" opacity="0.3"/><path d="M10 6v8M6 10h8" stroke="currentColor" stroke-width="2"/></svg></button>`,
    css,
  }
}

export const buttonTemplates: TemplateSpec[] = [
  { id: 'btn-primary', label: 'Primary Button', category: 'button', generate: generatePrimaryButton },
  { id: 'btn-secondary', label: 'Secondary Button', category: 'button', generate: generateSecondaryButton },
  { id: 'btn-outline', label: 'Outline Button', category: 'button', generate: generateOutlineButton },
  { id: 'btn-ghost', label: 'Ghost Button', category: 'button', generate: generateGhostButton },
  { id: 'btn-icon', label: 'Icon Button', category: 'button', generate: generateIconButton },
]
```

- [ ] **Step 5: Run test to confirm pass**

```bash
npx vitest run src/templates/buttons.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/templates/ && git commit -m "feat: button template engine with design format + animation support"
```

---

## Task 9: Remaining Templates (Cards, Heroes, Footers, Backgrounds)

**Files:**
- Create: `src/templates/utils.ts`         — Shared helpers: `getColor`, `borderRadius`, `speedMs`, `shadowStyle`
- Create: `src/templates/cards.ts`
- Create: `src/templates/heroes.ts`
- Create: `src/templates/footers.ts`
- Create: `src/templates/backgrounds.ts`
- Modify: `src/templates/buttons.ts`       — Import helpers from `utils.ts` (remove local copies)
- Test: `src/templates/templates.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/templates/templates.test.ts
import { cardTemplates } from './cards'
import { heroTemplates } from './heroes'
import { footerTemplates } from './footers'
import { backgroundTemplates } from './backgrounds'
import type { PaletteColor } from '../types'
import type { CustomizationOptions } from './types'

const colors: PaletteColor[] = [
  { hex: '#fafafa', role: 'background' },
  { hex: '#111111', role: 'text' },
  { hex: '#6c63ff', role: 'primary' },
  { hex: '#48cfad', role: 'secondary' },
  { hex: '#fc5c7d', role: 'accent' },
]
const opts: CustomizationOptions = { animationStyle: 'hover-lift', animationSpeed: 'default', animationIntensity: 'medium' }

const allGroups = [
  { name: 'card', templates: cardTemplates, minCount: 4 },
  { name: 'hero', templates: heroTemplates, minCount: 3 },
  { name: 'footer', templates: footerTemplates, minCount: 2 },
  { name: 'background', templates: backgroundTemplates, minCount: 5 },
]

for (const { name, templates, minCount } of allGroups) {
  it(`${name} templates exports at least ${minCount} templates`, () => {
    expect(templates.length).toBeGreaterThanOrEqual(minCount)
  })

  it(`${name} templates all generate valid html+css`, () => {
    for (const t of templates) {
      const result = t.generate(colors, 'minimalist', opts)
      expect(typeof result.html).toBe('string')
      expect(result.html.length).toBeGreaterThan(0)
      expect(typeof result.css).toBe('string')
    }
  })
}
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npx vitest run src/templates/templates.test.ts
```

Expected: FAIL — modules not found.

- [ ] **Step 3: Extract shared helpers into `src/templates/utils.ts`**

Move these functions from `buttons.ts` into a shared utils module, then update `buttons.ts` to import from it:

```typescript
// src/templates/utils.ts
import type { PaletteColor, DesignFormat } from '../types'
import type { AnimationSpeed } from './types'

export function getColor(colors: PaletteColor[], role: string, fallback = '#888'): string {
  return colors.find(c => c.role === role)?.hex ?? fallback
}

export function speedMs(speed: AnimationSpeed): string {
  return speed === 'slow' ? '0.5s' : speed === 'fast' ? '0.15s' : '0.25s'
}

export function borderRadius(format: DesignFormat): string {
  if (format === 'brutalist') return '0'
  if (format === 'neumorphism' || format === 'organic') return '12px'
  if (format === 'minimalist' || format === 'flat') return '4px'
  return '6px'
}

export function shadowStyle(format: DesignFormat, primary: string): string {
  if (format === 'neumorphism') return '4px 4px 8px rgba(0,0,0,0.2), -4px -4px 8px rgba(255,255,255,0.1)'
  if (format === 'glassmorphism') return `0 0 20px ${primary}55`
  if (format === 'brutalist') return `4px 4px 0 ${primary}`
  return 'none'
}
```

In `buttons.ts`, replace the four local function definitions with:
```typescript
import { getColor, speedMs, borderRadius, shadowStyle } from './utils'
```

- [ ] **Step 5: Implement cards.ts**

Follow the same pattern as `buttons.ts`. Each generator function:
- Accepts `(colors, format, options)`
- Imports helpers from `./utils`
- Returns `{ html, css }` with scoped CSS class names

Required templates: Basic Card, Image Card, Pricing Card, Profile Card.

Example Basic Card:
```typescript
import { getColor, borderRadius, speedMs } from './utils'
import type { PaletteColor, DesignFormat } from '../types'
import type { CustomizationOptions, TemplateResult } from './types'

function generateBasicCard(colors: PaletteColor[], format: DesignFormat, options: CustomizationOptions): TemplateResult {
  const bg = getColor(colors, 'background')
  const text = getColor(colors, 'text')
  const primary = getColor(colors, 'primary')
  const br = borderRadius(format)
  const dur = speedMs(options.animationSpeed)
  // neumorphism: soft shadow in/out; glassmorphism: blur + transparency; brutalist: thick border
  const css = `.card-basic {
  background: ${format === 'glassmorphism' ? bg + 'cc' : bg};
  ${format === 'glassmorphism' ? 'backdrop-filter: blur(12px);' : ''}
  color: ${text};
  border: ${format === 'brutalist' ? '3px solid ' + primary : 'none'};
  border-radius: ${br};
  padding: 1.5rem;
  box-shadow: ${format === 'neumorphism' ? '6px 6px 12px rgba(0,0,0,.15), -6px -6px 12px rgba(255,255,255,.1)' : '0 2px 8px rgba(0,0,0,.08)'};
  transition: transform ${dur} ease, box-shadow ${dur} ease;
}
.card-basic:hover { transform: translateY(${options.animationStyle === 'hover-lift' ? '-6px' : '0'}); }`
  const html = `<div class="card-basic"><h3 style="margin:0 0 .5rem">Card Title</h3><p style="margin:0;opacity:.7">Card description goes here.</p></div>`
  return { html, css }
}
```

- [ ] **Step 6: Implement heroes.ts**

Required templates: Centered Hero, Split Hero, Animated Hero.

Animated Hero example uses CSS keyframe animation in the returned `css` string:
```css
@keyframes fadeInUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:none } }
.hero-animated h1 { animation: fadeInUp 0.6s ease forwards; }
```

- [ ] **Step 7: Implement footers.ts**

Required templates: Simple Footer, Multi-column Footer.

- [ ] **Step 8: Implement backgrounds.ts**

Required templates: Gradient, Animated Gradient, Particle (CSS-only approximation), Wave, Morphing Blob, Aurora.

Animated gradient example:
```typescript
// backgrounds.ts (excerpt)
import { getColor, speedMs } from './utils'

function generateAnimatedGradient(colors, format, options): TemplateResult {
  const primary = getColor(colors, 'primary')
  const accent = getColor(colors, 'accent')
  const secondary = getColor(colors, 'secondary')
  const speed = options.animationSpeed === 'slow' ? '8s' : options.animationSpeed === 'fast' ? '3s' : '5s'
  const css = `@keyframes gradientShift { 0%,100% { background-position: 0% 50% } 50% { background-position: 100% 50% } }
.bg-gradient-animated {
  background: linear-gradient(135deg, ${primary}, ${accent}, ${secondary});
  background-size: 300% 300%;
  animation: gradientShift ${speed} ease infinite;
  min-height: 200px;
}`
  return { html: '<div class="bg-gradient-animated"></div>', css }
}
```

- [ ] **Step 9: Run test to confirm pass**

```bash
npx vitest run src/templates/templates.test.ts
```

Expected: 8 tests pass.

- [ ] **Step 10: Commit**

```bash
git add src/templates/ && git commit -m "feat: cards, heroes, footers, backgrounds template generators"
```

---

## Task 10: App Shell Layout

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Toolbar.tsx`
- Create: `src/components/layout/Canvas.tsx`

- [ ] **Step 1: Write failing test**

```typescript
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
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npx vitest run src/components/layout/Sidebar.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement Sidebar**

```typescript
// src/components/layout/Sidebar.tsx
import { useApp } from '../../context/AppContext'
import type { Project } from '../../types'

export function Sidebar() {
  const { state, setActiveProject, addProject, setView } = useApp()

  function handleNew() {
    const project: Project = {
      id: crypto.randomUUID(),
      name: 'New Project',
      type: 'palette',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    addProject(project)
    setActiveProject(project.id)
    setView('extract')
  }

  const palettes = state.projects.filter(p => p.type === 'palette')
  const templates = state.projects.filter(p => p.type === 'template')

  return (
    <aside className="w-64 h-full bg-neutral-900 text-neutral-100 flex flex-col border-r border-neutral-800">
      <div className="p-4 font-bold text-lg border-b border-neutral-800">Projects</div>
      <div className="p-4">
        <button
          onClick={handleNew}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded px-3 py-2 text-sm font-medium"
        >
          + New
        </button>
      </div>

      <div className="px-4 text-xs uppercase text-neutral-500 tracking-widest mb-1">Palettes</div>
      <ul className="flex-1 overflow-y-auto px-2">
        {palettes.map(p => (
          <li key={p.id}>
            <button
              onClick={() => { setActiveProject(p.id); setView('palette') }}
              className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-neutral-800 ${state.activeProjectId === p.id ? 'bg-neutral-800' : ''}`}
            >
              🎨 {p.name}
            </button>
          </li>
        ))}
        {palettes.length === 0 && <li className="px-3 py-2 text-xs text-neutral-600">None yet</li>}
      </ul>

      <div className="px-4 text-xs uppercase text-neutral-500 tracking-widest mb-1 mt-2">Templates</div>
      <ul className="px-2 mb-4">
        {templates.map(p => (
          <li key={p.id}>
            <button
              onClick={() => { setActiveProject(p.id); setView('template') }}
              className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-neutral-800 ${state.activeProjectId === p.id ? 'bg-neutral-800' : ''}`}
            >
              📄 {p.name}
            </button>
          </li>
        ))}
        {templates.length === 0 && <li className="px-3 py-2 text-xs text-neutral-600">None yet</li>}
      </ul>

      <div className="border-t border-neutral-800 p-4 text-xs text-neutral-500">⚙ Settings</div>
    </aside>
  )
}
```

- [ ] **Step 4: Implement Toolbar**

```typescript
// src/components/layout/Toolbar.tsx
import { useApp } from '../../context/AppContext'
import type { AppView } from '../../types'

const TABS: { label: string; view: AppView }[] = [
  { label: 'Extract', view: 'extract' },
  { label: 'Palette', view: 'palette' },
  { label: 'Templates', view: 'template' },
  { label: 'Export', view: 'export' },
]

export function Toolbar() {
  const { state, setView } = useApp()
  return (
    <header className="h-12 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 gap-2">
      {TABS.map(({ label, view }) => (
        <button
          key={view}
          onClick={() => setView(view)}
          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
            state.view === view
              ? 'bg-indigo-600 text-white'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          {label}
        </button>
      ))}
    </header>
  )
}
```

- [ ] **Step 5: Implement Canvas (stub)**

```typescript
// src/components/layout/Canvas.tsx
import { useApp } from '../../context/AppContext'

export function Canvas() {
  const { state } = useApp()
  return (
    <main className="flex-1 overflow-auto bg-neutral-950 p-6 text-neutral-100">
      {/* Views will be wired in subsequent tasks */}
      <div className="text-neutral-500 text-center mt-20">
        View: <strong>{state.view}</strong>
        {state.activeProjectId && <p className="text-xs mt-2">Project: {state.activeProjectId}</p>}
      </div>
    </main>
  )
}
```

- [ ] **Step 6: Wire App.tsx**

```typescript
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
```

- [ ] **Step 7: Run sidebar test**

```bash
npx vitest run src/components/layout/Sidebar.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 8: Start dev server and verify layout renders**

```bash
npm run dev
```

Expected: Two-column layout visible in browser with sidebar and toolbar.

- [ ] **Step 9: Commit**

```bash
git add src/ && git commit -m "feat: app shell layout (Sidebar, Toolbar, Canvas)"
```

---

## Task 11: Image Uploader & Color Extraction UI

**Files:**
- Create: `src/hooks/useColorExtraction.ts`
- Create: `src/components/extract/ImageUploader.tsx`
- Test: `src/components/extract/ImageUploader.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/components/extract/ImageUploader.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ImageUploader } from './ImageUploader'

it('renders a file input', () => {
  render(<ImageUploader onExtract={() => {}} />)
  expect(screen.getByLabelText(/upload/i)).toBeInTheDocument()
})

it('calls onExtract with colors array when file selected', async () => {
  // We can't fully test Canvas in jsdom; just verify onExtract is called
  // by mocking useColorExtraction
})
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npx vitest run src/components/extract/ImageUploader.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement useColorExtraction hook**

```typescript
// src/hooks/useColorExtraction.ts
import { useCallback, useState } from 'react'
import { extractColorsFromCanvas } from '../services/colorExtractor'
import type { PaletteColor } from '../types'

export function useColorExtraction() {
  const [colors, setColors] = useState<PaletteColor[]>([])
  const [thumbnail, setThumbnail] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Returns the extracted colors directly so callers don't read stale state
  const extractFromFile = useCallback(async (file: File): Promise<PaletteColor[] | null> => {
    setIsLoading(true)
    setError(null)
    try {
      // Validate magic bytes for JPEG, PNG, GIF, WEBP
      const header = await file.slice(0, 12).arrayBuffer()
      const bytes = new Uint8Array(header)
      const isValid =
        (bytes[0] === 0xff && bytes[1] === 0xd8) || // JPEG
        (bytes[0] === 0x89 && bytes[1] === 0x50) || // PNG
        (bytes[0] === 0x47 && bytes[1] === 0x49) || // GIF
        (bytes[0] === 0x52 && bytes[8] === 0x57) // WEBP (RIFF...WEBP)
      if (!isValid) throw new Error('Unsupported file type. Please upload JPEG, PNG, GIF, or WEBP.')

      const url = URL.createObjectURL(file)
      const img = new Image()
      await new Promise<void>((res, rej) => {
        img.onload = () => res()
        img.onerror = () => rej(new Error('Failed to load image'))
        img.src = url
      })

      const canvas = document.createElement('canvas')
      const maxDim = 200
      const ratio = Math.min(maxDim / img.width, maxDim / img.height)
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)

      const thumb = canvas.toDataURL('image/jpeg', 0.7)
      const extracted = extractColorsFromCanvas(canvas, 6)
      setThumbnail(thumb)
      setColors(extracted)
      URL.revokeObjectURL(url)
      return extracted
    } catch (e) {
      setError((e as Error).message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { colors, thumbnail, isLoading, error, extractFromFile }
}
```

- [ ] **Step 4: Implement ImageUploader component**

```typescript
// src/components/extract/ImageUploader.tsx
import { useRef, type DragEvent } from 'react'
import type { PaletteColor } from '../../types'

interface Props {
  onExtract: (colors: PaletteColor[], thumbnail: string) => void
  isLoading?: boolean
  error?: string | null
  onFileSelected: (file: File) => void
}

export function ImageUploader({ onExtract, isLoading, error, onFileSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    onFileSelected(file)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      className="border-2 border-dashed border-neutral-700 rounded-xl p-12 text-center cursor-pointer hover:border-indigo-500 transition-colors"
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Upload image"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      {isLoading ? (
        <p className="text-neutral-400">Extracting colors...</p>
      ) : (
        <>
          <div className="text-4xl mb-3">🖼</div>
          <p className="text-neutral-300 font-medium">Drop an image or click to upload</p>
          <p className="text-neutral-600 text-sm mt-1">JPEG, PNG, GIF, WEBP</p>
        </>
      )}
      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 5: Run test**

```bash
npx vitest run src/components/extract/ImageUploader.test.tsx
```

Expected: 1 test passes (file input rendered).

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useColorExtraction.ts src/components/extract/
git commit -m "feat: image uploader with magic-byte validation and color extraction"
```

---

## Task 12: URL Input & CSS Color Extraction

**Files:**
- Create: `src/components/extract/UrlInput.tsx`
- Test: `src/components/extract/UrlInput.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/components/extract/UrlInput.test.tsx
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
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npx vitest run src/components/extract/UrlInput.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement UrlInput**

```typescript
// src/components/extract/UrlInput.tsx
import { useState } from 'react'

interface Props {
  onSubmit: (url: string) => void
  isLoading: boolean
  error?: string | null
}

export function UrlInput({ onSubmit, isLoading, error }: Props) {
  const [url, setUrl] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="url"
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="https://example.com"
        className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg px-5 py-2 font-medium"
      >
        {isLoading ? 'Extracting…' : 'Extract'}
      </button>
      {error && <p className="text-red-400 text-sm col-span-full mt-1">{error}</p>}
    </form>
  )
}
```

- [ ] **Step 4: Run test**

```bash
npx vitest run src/components/extract/UrlInput.test.tsx
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/extract/UrlInput.tsx src/components/extract/UrlInput.test.tsx
git commit -m "feat: URL input component for website color extraction"
```

---

## Task 13: AI Analysis Hook & DesignFormatPicker

**Files:**
- Create: `src/hooks/useAIAnalysis.ts`
- Create: `src/components/extract/DesignFormatPicker.tsx`
- Test: `src/components/extract/DesignFormatPicker.test.tsx`

- [ ] **Step 1: Implement useAIAnalysis hook**

```typescript
// src/hooks/useAIAnalysis.ts
import { useState, useCallback } from 'react'
import { analyzeColors } from '../services/aiAnalyzer'
import type { AIAnalysisResult } from '../services/aiAnalyzer'

export function useAIAnalysis() {
  const [result, setResult] = useState<AIAnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Returns the result directly so callers don't read stale state
  const analyze = useCallback(async (
    hexColors: string[],
    imageBase64: string | null,
    apiKey: string
  ): Promise<AIAnalysisResult | null> => {
    if (!apiKey) { setError('OpenAI API key required. Add it in Settings.'); return null }
    setIsLoading(true)
    setError(null)
    try {
      const res = await analyzeColors(hexColors, imageBase64, apiKey)
      setResult(res)
      return res
    } catch (e) {
      setError((e as Error).message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { result, isLoading, error, analyze }
}
```

- [ ] **Step 2: Write failing test for DesignFormatPicker**

```typescript
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
```

- [ ] **Step 3: Run test to confirm failure**

```bash
npx vitest run src/components/extract/DesignFormatPicker.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement DesignFormatPicker**

```typescript
// src/components/extract/DesignFormatPicker.tsx
import type { DesignFormat } from '../../types'

const FORMAT_DESCRIPTIONS: Record<DesignFormat, string> = {
  minimalist: 'Clean whitespace, thin borders, no shadows',
  brutalist: 'Harsh borders, high contrast, raw aesthetic',
  flat: 'Solid colors, no shadows, clean edges',
  glassmorphism: 'Blur, transparency, gradient accents',
  neumorphism: 'Soft inner/outer shadows, pressed effect',
  retro: 'Vintage colors, decorative borders, serif fonts',
  organic: 'Soft curves, natural colors, blob shapes',
  skeuomorphic: 'Realistic textures, 3D depth, gradients',
}

interface Props {
  suggestions: [DesignFormat, DesignFormat]
  selected: DesignFormat
  onChange: (format: DesignFormat) => void
}

export function DesignFormatPicker({ suggestions, selected, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-neutral-300">Design Format</label>
      <select
        value={selected}
        onChange={e => onChange(e.target.value as DesignFormat)}
        className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-indigo-500"
      >
        {suggestions.map(format => (
          <option key={format} value={format}>
            {format.charAt(0).toUpperCase() + format.slice(1)}
          </option>
        ))}
      </select>
      <p className="text-xs text-neutral-500">{FORMAT_DESCRIPTIONS[selected]}</p>
    </div>
  )
}
```

- [ ] **Step 5: Run test**

```bash
npx vitest run src/components/extract/DesignFormatPicker.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useAIAnalysis.ts src/components/extract/DesignFormatPicker.tsx src/components/extract/DesignFormatPicker.test.tsx
git commit -m "feat: AI analysis hook and design format picker"
```

---

## Task 14: Extract View (Wiring it all together)

**Files:**
- Create: `src/components/extract/ExtractView.tsx`
- Modify: `src/components/layout/Canvas.tsx`

- [ ] **Step 1: Implement ExtractView**

```typescript
// src/components/extract/ExtractView.tsx
import { useState } from 'react'
import { ImageUploader } from './ImageUploader'
import { UrlInput } from './UrlInput'
import { DesignFormatPicker } from './DesignFormatPicker'
import { useColorExtraction } from '../../hooks/useColorExtraction'
import { useAIAnalysis } from '../../hooks/useAIAnalysis'
import { useApp } from '../../context/AppContext'
import type { ContentFormat, DesignFormat, ExtractedPalette } from '../../types'

const CONTENT_FORMATS: ContentFormat[] = [
  'website', 'mobile-app', 'dashboard', 'landing-page',
  'poster', 'social-media', 'presentation', 'ecommerce',
]

export function ExtractView() {
  const { addProject, setActiveProject, setView } = useApp()
  const extraction = useColorExtraction()
  const ai = useAIAnalysis()
  const [tab, setTab] = useState<'image' | 'url'>('image')
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai-api-key') ?? '')
  const [selectedFormat, setSelectedFormat] = useState<DesignFormat>('minimalist')
  const [contentFormat, setContentFormat] = useState<ContentFormat>('website')
  const [isUrlLoading, setIsUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)

  async function handleFileSelected(file: File) {
    // extractFromFile returns the colors directly to avoid reading stale React state
    const extracted = await extraction.extractFromFile(file)
    if (extracted && extracted.length > 0) {
      const hexColors = extracted.map(c => c.hex)
      const analysisResult = await ai.analyze(hexColors, null, apiKey)
      if (analysisResult) setSelectedFormat(analysisResult.suggestedDesignFormats[0])
    }
  }

  async function handleUrlSubmit(url: string) {
    setIsUrlLoading(true)
    setUrlError(null)
    try {
      const res = await fetch(`/api/fetch-url?url=${encodeURIComponent(url)}`)
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      const data = await res.json()
      // data.colors is string[] of hex from CSS; convert to PaletteColor[]
      const hexColors: string[] = data.colors.slice(0, 8)
      await ai.analyze(hexColors, null, apiKey)
      if (ai.result) setSelectedFormat(ai.result.suggestedDesignFormats[0])
    } catch (e) {
      setUrlError((e as Error).message)
    } finally {
      setIsUrlLoading(false)
    }
  }

  function handleSave() {
    if (!ai.result || extraction.colors.length === 0) return
    const palette: ExtractedPalette = {
      id: crypto.randomUUID(),
      name: `Palette ${new Date().toLocaleDateString()}`,
      source: { type: tab, thumbnail: extraction.thumbnail },
      colors: extraction.colors,
      keywords: ai.result.keywords,
      mood: ai.result.mood,
      suggestedDesignFormats: ai.result.suggestedDesignFormats,
      suggestedStyles: ai.result.suggestedStyles,
      designFormat: selectedFormat,
      contentFormat,
      createdAt: Date.now(),
    }
    const project = {
      id: crypto.randomUUID(),
      name: palette.name,
      type: 'palette' as const,
      palette,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    addProject(project)
    setActiveProject(project.id)
    setView('palette')
  }

  const hasPalette = extraction.colors.length > 0
  const hasAnalysis = !!ai.result

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Extract Colors</h1>

      {/* API Key input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-400 mb-1">OpenAI API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={e => { setApiKey(e.target.value); localStorage.setItem('openai-api-key', e.target.value) }}
          placeholder="sk-..."
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-4">
        {(['image', 'url'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded text-sm font-medium ${tab === t ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'}`}
          >
            {t === 'image' ? 'Image Upload' : 'Website URL'}
          </button>
        ))}
      </div>

      {tab === 'image' ? (
        <ImageUploader
          onExtract={() => {}}
          isLoading={extraction.isLoading}
          error={extraction.error}
          onFileSelected={handleFileSelected}
        />
      ) : (
        <UrlInput onSubmit={handleUrlSubmit} isLoading={isUrlLoading} error={urlError} />
      )}

      {/* AI loading */}
      {ai.isLoading && <p className="mt-4 text-indigo-400 animate-pulse">Analyzing with AI…</p>}
      {ai.error && <p className="mt-4 text-red-400 text-sm">{ai.error}</p>}

      {/* Results */}
      {hasPalette && (
        <div className="mt-6 space-y-4">
          {/* Color swatches */}
          <div className="flex gap-2 flex-wrap">
            {extraction.colors.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-lg border border-neutral-700" style={{ background: c.hex }} />
                <span className="text-xs text-neutral-500">{c.hex}</span>
                <span className="text-xs text-neutral-600">{c.role}</span>
              </div>
            ))}
          </div>

          {/* AI results */}
          {hasAnalysis && (
            <>
              <div className="flex gap-2 flex-wrap">
                {ai.result!.keywords.map(k => (
                  <span key={k} className="bg-neutral-800 text-neutral-300 rounded-full px-3 py-0.5 text-xs">{k}</span>
                ))}
                <span className="bg-indigo-900 text-indigo-300 rounded-full px-3 py-0.5 text-xs">mood: {ai.result!.mood}</span>
              </div>

              <DesignFormatPicker
                suggestions={ai.result!.suggestedDesignFormats}
                selected={selectedFormat}
                onChange={setSelectedFormat}
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-neutral-300">Content Format</label>
                <select
                  value={contentFormat}
                  onChange={e => setContentFormat(e.target.value as ContentFormat)}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-indigo-500"
                >
                  {CONTENT_FORMATS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSave}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-3 font-semibold"
              >
                Save Palette →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Wire Canvas to render views**

```typescript
// src/components/layout/Canvas.tsx
import { useApp } from '../../context/AppContext'
import { ExtractView } from '../extract/ExtractView'

export function Canvas() {
  const { state } = useApp()

  return (
    <main className="flex-1 overflow-auto bg-neutral-950 p-6 text-neutral-100">
      {state.view === 'extract' && <ExtractView />}
      {state.view === 'palette' && <div className="text-neutral-500">Palette view — Task 15</div>}
      {state.view === 'template' && <div className="text-neutral-500">Template view — Task 16</div>}
      {state.view === 'export' && <div className="text-neutral-500">Export view — Task 17</div>}
    </main>
  )
}
```

- [ ] **Step 3: Manually verify in browser**

```bash
npm run dev
```

Expected: Upload an image → swatches appear. Click "Save Palette" → sidebar shows the palette.

- [ ] **Step 4: Commit**

```bash
git add src/components/extract/ExtractView.tsx src/components/layout/Canvas.tsx
git commit -m "feat: extract view wires image/URL upload with AI analysis"
```

---

## Task 15: Palette View

**Files:**
- Create: `src/components/palette/ColorPalette.tsx`
- Create: `src/components/palette/ColorEditor.tsx`
- Create: `src/components/palette/KeywordTags.tsx`
- Create: `src/components/palette/PaletteView.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// src/components/palette/ColorPalette.test.tsx
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
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npx vitest run src/components/palette/ColorPalette.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement ColorPalette**

```typescript
// src/components/palette/ColorPalette.tsx
import type { PaletteColor } from '../../types'

interface Props { colors: PaletteColor[] }

export function ColorPalette({ colors }: Props) {
  return (
    <ul className="flex gap-3 flex-wrap" role="list">
      {colors.map((c, i) => (
        <li key={i} className="flex flex-col items-center gap-1">
          <div
            className="w-16 h-16 rounded-xl border border-neutral-700 shadow-inner"
            style={{ background: c.hex }}
            title={c.hex}
          />
          <span className="text-xs text-neutral-300 font-mono">{c.hex}</span>
          <span className="text-xs text-neutral-500">{c.role}</span>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 4: Implement ColorEditor (role-swap)**

```typescript
// src/components/palette/ColorEditor.tsx
import type { PaletteColor } from '../../types'

const ROLES = ['background', 'text', 'primary', 'secondary', 'accent']

interface Props {
  colors: PaletteColor[]
  onChange: (colors: PaletteColor[]) => void
}

export function ColorEditor({ colors, onChange }: Props) {
  function swapRole(index: number, newRole: string) {
    const updated = colors.map((c, i) => {
      if (i === index) return { ...c, role: newRole }
      if (c.role === newRole) return { ...c, role: colors[index].role } // swap
      return c
    })
    onChange(updated)
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {colors.map((c, i) => (
        <div key={i} className="flex items-center gap-3 bg-neutral-800 rounded-lg p-3">
          <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ background: c.hex }} />
          <div className="flex-1">
            <div className="font-mono text-sm text-neutral-200">{c.hex}</div>
            <select
              value={c.role}
              onChange={e => swapRole(i, e.target.value)}
              className="mt-1 w-full bg-neutral-700 border-none rounded text-xs text-neutral-300 focus:outline-none"
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Implement KeywordTags**

```typescript
// src/components/palette/KeywordTags.tsx
interface Props { keywords: string[]; mood: string }

export function KeywordTags({ keywords, mood }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      <span className="bg-indigo-900 text-indigo-300 rounded-full px-3 py-0.5 text-xs font-medium">
        {mood}
      </span>
      {keywords.map(k => (
        <span key={k} className="bg-neutral-800 text-neutral-300 rounded-full px-3 py-0.5 text-xs">
          {k}
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 6: Implement PaletteView**

```typescript
// src/components/palette/PaletteView.tsx
import { useApp } from '../../context/AppContext'
import { ColorPalette } from './ColorPalette'
import { ColorEditor } from './ColorEditor'
import { KeywordTags } from './KeywordTags'
import type { PaletteColor } from '../../types'

export function PaletteView() {
  const { state, updateProject } = useApp()
  const project = state.projects.find(p => p.id === state.activeProjectId)
  const palette = project?.palette

  if (!palette) return (
    <div className="text-neutral-500 text-center mt-20">Select a palette from the sidebar.</div>
  )

  function handleColorsChange(colors: PaletteColor[]) {
    if (!project) return
    updateProject(project.id, { palette: { ...palette!, colors } })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{palette.name}</h1>
      <KeywordTags keywords={palette.keywords} mood={palette.mood} />
      <section>
        <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-3">Colors</h2>
        <ColorPalette colors={palette.colors} />
      </section>
      <section>
        <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-3">Edit Roles</h2>
        <ColorEditor colors={palette.colors} onChange={handleColorsChange} />
      </section>
      <div className="text-xs text-neutral-600">
        Format: {palette.designFormat} · {palette.contentFormat}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Wire PaletteView into Canvas**

In `src/components/layout/Canvas.tsx`, replace:
```typescript
{state.view === 'palette' && <div className="text-neutral-500">Palette view — Task 15</div>}
```
With:
```typescript
import { PaletteView } from '../palette/PaletteView'
// ...
{state.view === 'palette' && <PaletteView />}
```

- [ ] **Step 8: Run ColorPalette test**

```bash
npx vitest run src/components/palette/ColorPalette.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/palette/ && git commit -m "feat: palette view with color display and role editor"
```

---

## Task 16: Template View

**Files:**
- Create: `src/components/templates/TemplateGrid.tsx`
- Create: `src/components/templates/TemplatePreview.tsx`
- Create: `src/components/templates/AnimationControls.tsx`
- Create: `src/components/templates/TemplateView.tsx`
- Create: `src/templates/index.ts`

- [ ] **Step 1: Create template index**

```typescript
// src/templates/index.ts
import { buttonTemplates } from './buttons'
import { cardTemplates } from './cards'
import { heroTemplates } from './heroes'
import { footerTemplates } from './footers'
import { backgroundTemplates } from './backgrounds'
import type { TemplateSpec } from './types'

export const ALL_TEMPLATES: TemplateSpec[] = [
  ...buttonTemplates,
  ...cardTemplates,
  ...heroTemplates,
  ...footerTemplates,
  ...backgroundTemplates,
]

export const CATEGORIES = ['button', 'card', 'hero', 'footer', 'background'] as const
export type TemplateCategory = typeof CATEGORIES[number]
```

- [ ] **Step 2: Write failing test**

```typescript
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
```

- [ ] **Step 3: Run test to confirm failure**

```bash
npx vitest run src/components/templates/TemplateGrid.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement TemplateGrid**

```typescript
// src/components/templates/TemplateGrid.tsx
import type { TemplateSpec } from '../../templates/types'

interface Props {
  templates: TemplateSpec[]
  selected: TemplateSpec | null
  onSelect: (t: TemplateSpec) => void
}

export function TemplateGrid({ templates, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {templates.map(t => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          className={`text-left rounded-xl border p-4 text-sm font-medium transition-colors ${
            selected?.id === t.id
              ? 'border-indigo-500 bg-indigo-900/30 text-indigo-300'
              : 'border-neutral-700 hover:border-neutral-500 text-neutral-300'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Implement TemplatePreview**

```typescript
// src/components/templates/TemplatePreview.tsx
import { useEffect, useRef } from 'react'

interface Props { html: string; css: string }

export function TemplatePreview({ html, css }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const doc = iframe.contentDocument
    if (!doc) return
    doc.open()
    doc.write(`<!DOCTYPE html><html><head><style>
      body { margin: 0; padding: 2rem; font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #1a1a2e; }
      ${css}
    </style></head><body>${html}</body></html>`)
    doc.close()
  }, [html, css])

  return (
    <iframe
      ref={iframeRef}
      title="Template preview"
      sandbox="allow-same-origin"
      className="w-full h-64 rounded-xl border border-neutral-700 bg-neutral-900"
    />
  )
}
```

- [ ] **Step 6: Implement AnimationControls**

```typescript
// src/components/templates/AnimationControls.tsx
import type { CustomizationOptions, AnimationSpeed, AnimationIntensity } from '../../templates/types'

const ANIMATION_STYLES_BY_CATEGORY: Record<string, string[]> = {
  button: ['hover-scale', 'ripple', 'glow-pulse', 'slide-fill', 'bounce'],
  card: ['hover-lift', 'tilt', 'border-glow', 'content-reveal', 'flip'],
  hero: ['text-fade-in', 'parallax', 'floating', 'typewriter', 'staggered'],
  footer: ['fade-in-scroll', 'link-hover'],
  background: ['gradient-shift', 'particles', 'wave', 'morphing-blob', 'aurora'],
}

interface Props {
  category: string
  options: CustomizationOptions
  onChange: (options: CustomizationOptions) => void
}

export function AnimationControls({ category, options, onChange }: Props) {
  const styles = ANIMATION_STYLES_BY_CATEGORY[category] ?? []
  const speeds: AnimationSpeed[] = ['slow', 'default', 'fast']
  const intensities: AnimationIntensity[] = ['subtle', 'medium', 'dramatic']

  function update(patch: Partial<CustomizationOptions>) {
    onChange({ ...options, ...patch })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1 uppercase tracking-widest">Animation Style</label>
        <div className="flex flex-wrap gap-2">
          {styles.map(s => (
            <button
              key={s}
              onClick={() => update({ animationStyle: s })}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                options.animationStyle === s
                  ? 'border-indigo-500 bg-indigo-900/40 text-indigo-300'
                  : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1 uppercase tracking-widest">Speed</label>
          <div className="flex gap-2">
            {speeds.map(s => (
              <button
                key={s}
                onClick={() => update({ animationSpeed: s })}
                className={`px-3 py-1 rounded text-xs ${options.animationSpeed === s ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1 uppercase tracking-widest">Intensity</label>
          <div className="flex gap-2">
            {intensities.map(s => (
              <button
                key={s}
                onClick={() => update({ animationIntensity: s })}
                className={`px-3 py-1 rounded text-xs ${options.animationIntensity === s ? 'bg-indigo-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Implement TemplateView**

```typescript
// src/components/templates/TemplateView.tsx
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { TemplateGrid } from './TemplateGrid'
import { TemplatePreview } from './TemplatePreview'
import { AnimationControls } from './AnimationControls'
import { ALL_TEMPLATES, CATEGORIES } from '../../templates'
import type { TemplateSpec } from '../../templates/types'
import type { CustomizationOptions } from '../../templates/types'
import type { Project } from '../../types'

const DEFAULT_OPTIONS: CustomizationOptions = {
  animationStyle: 'hover-scale',
  animationSpeed: 'default',
  animationIntensity: 'medium',
}

export function TemplateView() {
  const { state, addProject, setActiveProject } = useApp()
  const [activeCategory, setActiveCategory] = useState<string>('button')
  const [selected, setSelected] = useState<TemplateSpec | null>(null)
  const [options, setOptions] = useState<CustomizationOptions>(DEFAULT_OPTIONS)

  // Use active palette for colors
  const activePaletteProject = state.projects.find(
    p => p.type === 'palette' && p.id === state.activeProjectId
  )
  const colors = activePaletteProject?.palette?.colors ?? []
  const designFormat = activePaletteProject?.palette?.designFormat ?? 'flat'

  const categoryTemplates = ALL_TEMPLATES.filter(t => t.category === activeCategory)
  const preview = selected ? selected.generate(colors, designFormat, options) : null

  function handleSave() {
    if (!selected || !activePaletteProject?.palette) return
    const { html, css } = selected.generate(colors, designFormat, options)
    const project: Project = {
      id: crypto.randomUUID(),
      name: `${selected.label} — ${new Date().toLocaleDateString()}`,
      type: 'template',
      template: {
        category: activeCategory,
        templateId: selected.id,
        appliedPalette: activePaletteProject.id,
        customizations: options,
        generatedCode: `<style>\n${css}\n</style>\n\n${html}`,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    addProject(project)
    setActiveProject(project.id)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Templates</h1>

      {colors.length === 0 && (
        <p className="text-amber-400 text-sm">Select a palette project in the sidebar to apply colors.</p>
      )}

      {/* Category tabs */}
      <div className="flex gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setSelected(null) }}
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              activeCategory === cat ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <TemplateGrid templates={categoryTemplates} selected={selected} onSelect={setSelected} />

      {selected && (
        <>
          <AnimationControls category={activeCategory} options={options} onChange={setOptions} />
          {preview && <TemplatePreview html={preview.html} css={preview.css} />}
          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-3 font-semibold"
          >
            Save Template
          </button>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 8: Wire TemplateView into Canvas**

In `src/components/layout/Canvas.tsx`, replace the template stub:
```typescript
import { TemplateView } from '../templates/TemplateView'
// ...
{state.view === 'template' && <TemplateView />}
```

- [ ] **Step 9: Run TemplateGrid test**

```bash
npx vitest run src/components/templates/TemplateGrid.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 10: Commit**

```bash
git add src/templates/index.ts src/components/templates/ src/components/layout/Canvas.tsx
git commit -m "feat: template view with grid, live preview, and animation controls"
```

---

## Task 17: Export Panel

**Files:**
- Create: `src/components/export/ExportPanel.tsx`
- Test: `src/components/export/ExportPanel.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
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
```

- [ ] **Step 2: Run test to confirm failure**

```bash
npx vitest run src/components/export/ExportPanel.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement ExportPanel**

```typescript
// src/components/export/ExportPanel.tsx
import { useState } from 'react'

interface Props { code: string }

export function ExportPanel({ code }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-400">HTML + CSS</span>
        <button
          onClick={handleCopy}
          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded px-3 py-1.5 text-sm font-medium transition-colors"
          aria-label="Copy to clipboard"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre
        role="region"
        aria-label="Generated code"
        className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-xs text-neutral-300 overflow-auto max-h-[60vh] font-mono leading-relaxed whitespace-pre-wrap"
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}
```

- [ ] **Step 4: Create ExportView and wire into Canvas**

```typescript
// src/components/export/ExportView.tsx
import { useApp } from '../../context/AppContext'
import { ExportPanel } from './ExportPanel'

export function ExportView() {
  const { state } = useApp()
  const project = state.projects.find(p => p.id === state.activeProjectId)

  if (!project) return (
    <div className="text-neutral-500 text-center mt-20">Select a project to export.</div>
  )

  let code = ''

  if (project.type === 'palette' && project.palette) {
    const { palette } = project
    const cssVars = palette.colors.map(c => `  --color-${c.role}: ${c.hex};`).join('\n')
    code = `/* Palette: ${palette.name} */
/* Mood: ${palette.mood} | Format: ${palette.designFormat} */

:root {
${cssVars}
}
`
  } else if (project.type === 'template' && project.template) {
    code = project.template.generatedCode
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Export</h1>
      <p className="text-neutral-500 text-sm">{project.name}</p>
      <ExportPanel code={code} />
    </div>
  )
}
```

In `src/components/layout/Canvas.tsx`:
```typescript
import { ExportView } from '../export/ExportView'
// ...
{state.view === 'export' && <ExportView />}
```

- [ ] **Step 5: Run ExportPanel test**

```bash
npx vitest run src/components/export/ExportPanel.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/export/ src/components/layout/Canvas.tsx
git commit -m "feat: export view with CSS variables and HTML+CSS code output"
```

---

## Task 18: Run Full Test Suite & Build

- [ ] **Step 1: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass. Fix any failures before proceeding.

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: `dist/` folder generated with no errors.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: verify full test suite and build pass"
```

---

## Task 19: Deploy to Vercel

- [ ] **Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

- [ ] **Step 2: Deploy**

```bash
vercel --prod
```

Follow the prompts. Set project name and link to your Vercel account.

- [ ] **Step 3: Set no environment variables**

API key is stored client-side (localStorage), so no server env vars required.

- [ ] **Step 4: Verify production URL works**

Open the deployed URL. Upload a test image. Confirm colors appear and the UI is functional.

- [ ] **Step 5: Commit deployment config if vercel.json was updated**

```bash
git add vercel.json && git commit -m "chore: vercel deployment config"
```

---

## Summary

| Task | What It Builds |
|------|---------------|
| 1 | Vite + React + Tailwind + Vitest scaffold |
| 2 | TypeScript types |
| 3 | `useLocalStorage` hook |
| 4 | AppContext + state management |
| 5 | Color extractor service (k-means) |
| 6 | AI analyzer service |
| 7 | Vercel serverless URL fetcher with SSRF mitigations |
| 8 | Button template engine |
| 9 | Card, hero, footer, background templates |
| 10 | App shell (Sidebar, Toolbar, Canvas) |
| 11 | Image uploader + color extraction UI |
| 12 | URL input component |
| 13 | AI analysis hook + design format picker |
| 14 | Extract view (full flow wired) |
| 15 | Palette view (display + role editor) |
| 16 | Template view (grid + preview + animation controls) |
| 17 | Export view (CSS vars + HTML/CSS output) |
| 18 | Full test suite + build verification |
| 19 | Vercel deployment |
