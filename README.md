# Palette Extractor

A color palette and style extractor web app. Upload an image or provide a website URL to extract a color palette, optionally analyze it with GPT-4o Vision AI, and generate animated UI component templates you can customize and export as HTML/CSS.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS v4
- Vitest + Testing Library
- Vercel (deployment + serverless API)

## Features

- **Image upload** — extracts dominant colors via k-means clustering
- **URL extraction** — fetches CSS colors from any public website (serverless, SSRF-hardened)
- **AI analysis** — optional GPT-4o Vision analysis for mood, keywords, and design format suggestions (requires OpenAI API key)
- **Template engine** — buttons, cards, heroes, footers, backgrounds with animation controls
- **Export** — CSS custom properties + standalone HTML/CSS

## Development

```bash
npm install
npm run dev        # http://localhost:5173 (URL extraction requires vercel dev)
vercel dev         # http://localhost:3000 (full stack including /api/fetch-url)
```

## Testing

```bash
npm test           # run all tests (49 tests, 15 files)
npm run build      # production build
```

## Deployment

```bash
vercel --prod
```

No environment variables required. The OpenAI API key is entered by the user in the UI and stored in their browser's localStorage.
