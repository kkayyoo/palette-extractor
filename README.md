# Palette Extractor

A color palette and style extraction tool. Upload an image or point it at a website URL to pull out a color palette, optionally enrich it with AI analysis, then apply it to animated UI component templates and export the result as ready-to-use HTML/CSS.

---

## Features

### Color Extraction
- **Image upload** — drag-and-drop or click to upload any image; dominant colors are extracted using k-means clustering directly in the browser (no server required)
- **Website URL** — enter any public URL to pull CSS hex colors from the page's HTML and stylesheets; runs through a serverless proxy with SSRF mitigations (blocks private IPs, redirects to non-HTTP, oversized responses)

### AI Analysis *(optional — requires OpenAI API key)*
- Sends extracted hex colors to GPT-4o Vision for mood tagging, keyword generation, and design format suggestions (e.g. "minimalist", "glassmorphism", "brutalist")
- Works fully without an API key — color extraction, template generation, and export all function with sensible defaults

### Palette Editor
- View extracted colors with their assigned roles (primary, secondary, accent, background, text)
- Reassign roles via drag-and-drop role swapper
- Keyword and mood tags displayed when AI analysis was run

### Template Engine
Five component categories, each with multiple design variants generated from your palette:
| Category | Templates |
|---|---|
| **Button** | solid, outline, ghost, gradient |
| **Card** | basic, media, horizontal, glass |
| **Hero** | centered, split, minimal |
| **Footer** | simple, columns, dark |
| **Background** | gradient, mesh, wave, geometric |

Each template is rendered live in a sandboxed iframe. Animation controls let you adjust:
- **Style** — per-category options (e.g. hover-scale, pulse, ripple for buttons; fade-in, slide-up for cards)
- **Speed** — slow / default / fast
- **Intensity** — subtle / medium / strong

### Export
- **Palette export** — generates CSS custom properties (`--color-primary`, `--color-secondary`, etc.) ready to drop into any stylesheet
- **Template export** — full standalone HTML + CSS with animations, copyable in one click
- Copy-to-clipboard with visual confirmation

### Project Management
- All projects (palettes and saved templates) persist in `localStorage` — no account or backend required
- Sidebar lists all saved projects; switch between them instantly

---

## Status

| Feature | Status |
|---|---|
| Image color extraction | ✅ Complete |
| Website URL extraction | ✅ Complete |
| AI analysis (GPT-4o) | ✅ Complete |
| Palette editor (role assignment) | ✅ Complete |
| Template engine (5 categories) | ✅ Complete |
| Animation controls | ✅ Complete |
| CSS vars + HTML/CSS export | ✅ Complete |
| localStorage project persistence | ✅ Complete |
| Vercel deployment | 🚧 In progress |
| Multi-image batch extraction | 🚧 In progress |
| Palette history / undo | 🚧 In progress |
| Share palette via URL | 🚧 In progress |

---

## Stack

- **React 18 + TypeScript + Vite**
- **Tailwind CSS v4**
- **Vitest + Testing Library** (49 tests across 15 files)
- **Vercel** — static frontend + serverless `api/fetch-url.ts`

---

## Development

```bash
npm install
npm run dev       # http://localhost:5173
                  # Note: URL extraction requires vercel dev (see below)
vercel dev        # http://localhost:3000 — full stack including /api/fetch-url
```

```bash
npm test          # run all tests
npm run build     # production build
```

## Deployment

```bash
vercel --prod
```

No server-side environment variables required. The OpenAI API key is entered by the user in the UI and stored in their browser's `localStorage`.
