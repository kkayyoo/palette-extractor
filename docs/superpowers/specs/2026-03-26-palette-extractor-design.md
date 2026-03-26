# Color Palette & Style Extractor - Design Spec

## Overview

A web-based tool that extracts color palettes and design styles from images or websites, then generates styled UI component templates with animations. Users can save, compare, and export their work.

## Core User Flow

1. **Extract & Analyze** — User uploads an image or enters a URL
   - Color extraction via Canvas API (image) or CSS parsing (URL)
   - AI analysis (GPT-4o Vision) returns: colors, keywords, mood, 2 suggested design formats

2. **Select Formats**
   - User picks design format from dropdown (2 AI suggestions) with live preview
   - User selects content format (website, mobile-app, dashboard, landing-page, poster, social-media, presentation, ecommerce)

3. **Choose Templates** — Browse and select from:
   - Buttons (Primary, Secondary, Outline, Ghost, Icon button)
   - Cards (Basic, Image, Pricing, Profile)
   - Hero Sections (Centered, Split, Animated)
   - Footers (Simple, Multi-column, CTA)
   - Backgrounds (Gradient, Animated gradient, Particle, Wave, Blob)

4. **Customize** — Adjust:
   - Colors (swap color roles)
   - Animation style (category-specific options)
   - Animation speed (Slow / Default / Fast)
   - Animation intensity (Subtle / Medium / Dramatic)

5. **Export** — Copy HTML + CSS with palette variables and animations

## App Layout

```
┌─────────────────┬─────────────────────────────────────────────────┐
│ PROJECTS        │  ┌─────────────────────────────────────────────┐│
│                 │  │  Toolbar: [Extract] [Templates] [Export]    ││
│ + New           │  └─────────────────────────────────────────────┘│
│                 │                                                 │
│ PALETTES        │  ┌─────────────────────────────────────────────┐│
│  🎨 Happy Kitty │  │                                             ││
│  🎨 Corp Site   │  │             Main Canvas                     ││
│                 │  │                                             ││
│ TEMPLATES       │  │  (Content changes based on selection)       ││
│  📄 Hero v1     │  │                                             ││
│  📄 Card Set    │  └─────────────────────────────────────────────┘│
│                 │                                                 │
│─────────────────│                                                 │
│ ⚙ Settings      │                                                 │
└─────────────────┴─────────────────────────────────────────────────┘
```

- **Left Sidebar**: Project browser with saved palettes and templates
- **Main Canvas**: Dynamic content area for extraction, editing, preview, export

## Data Models

### ExtractedPalette

```typescript
interface ExtractedPalette {
  id: string;
  name: string;
  source: { type: 'image' | 'url'; thumbnail: string };
  
  // Extracted by AI
  colors: Array<{ hex: string; role: string }>;
  keywords: string[];
  mood: string;
  suggestedDesignFormats: [DesignFormat, DesignFormat];
  suggestedStyles: {
    borderRadius: 'sharp' | 'rounded' | 'pill';
    shadows: 'none' | 'subtle' | 'soft' | 'dramatic';
    typography: 'modern' | 'classic' | 'friendly' | 'bold';
  };
  
  // Selected by user
  designFormat: DesignFormat;
  contentFormat: ContentFormat;
  
  createdAt: number;
}

type DesignFormat = 'minimalist' | 'brutalist' | 'flat' | 'glassmorphism' | 'neumorphism' | 'retro' | 'organic' | 'skeuomorphic';

type ContentFormat = 'website' | 'mobile-app' | 'dashboard' | 'landing-page' | 'poster' | 'social-media' | 'presentation' | 'ecommerce';
```

### Project

```typescript
interface Project {
  id: string;
  name: string;
  type: 'palette' | 'template';
  
  palette?: ExtractedPalette;
  
  template?: {
    category: string;
    templateId: string;
    appliedPalette: string;
    customizations: object;
    generatedCode: string;
  };
  
  createdAt: number;
  updatedAt: number;
}
```

### AppState

```typescript
interface AppState {
  projects: Project[];
  activeProjectId: string | null;
  view: 'extract' | 'palette' | 'template' | 'export';
}
```

## Extraction System

### Image Extraction Pipeline

1. User drops/selects image → load into Canvas API
2. **Color extraction** (client-side): K-means clustering → 5-8 dominant colors → auto-assign roles
3. **Style analysis** (AI): Send to GPT-4o Vision → returns keywords, mood, 2 design format suggestions

### URL Extraction Pipeline

1. User enters URL → serverless function fetches page
2. **CSS parsing** (server-side): Extract colors, fonts, patterns from stylesheets
3. **Style analysis** (AI): Same GPT-4o Vision analysis

### Design Format Selection

- Dropdown with 2 AI-suggested options only (MVP)
- Live preview updates when selection changes
- Brief description explains each style

## Template System

### Animation Types

| Category | Animation Options |
|----------|-------------------|
| Buttons | Hover scale, Ripple effect, Glow pulse, Slide fill, Bounce |
| Cards | Hover lift, Tilt on hover, Border glow, Content reveal, Flip |
| Hero | Text fade-in, Parallax scroll, Floating elements, Typewriter, Staggered reveal |
| Footers | Fade-in on scroll, Link hover effects |
| Backgrounds | Gradient shift, Floating particles, Wave motion, Morphing blobs, Aurora effect |

### Design Format Effects

| Design Format | Visual Treatment |
|---------------|------------------|
| Minimalist | No shadows, thin borders, lots of whitespace |
| Glassmorphism | Blur backdrop, transparency, gradient accents |
| Brutalist | Harsh borders, high contrast, no rounded corners |
| Flat | Solid colors, no shadows, clean edges |
| Neumorphism | Soft inner/outer shadows, pressed/raised effect |
| Retro | Vintage colors, decorative borders, serif fonts |
| Organic | Soft curves, natural colors, blob shapes |
| Skeuomorphic | Realistic textures, gradients, 3D depth |

### Customization Controls

- Colors: Swap color roles (primary, secondary, accent, background)
- Animation style: Select from category-specific options
- Animation speed: Slow / Default / Fast
- Animation intensity: Subtle / Medium / Dramatic

## Export System (MVP)

**Formats:**
- CSS Variables (palette)
- HTML + CSS (templates with animations)

**UI:**
- Single code preview panel
- Copy to clipboard button

## Security

### URL Fetching

| Risk | Mitigation |
|------|------------|
| SSRF | Validate URL — block private IPs, localhost, internal hostnames, non-HTTP(S) |
| Malicious content | Parse CSS/HTML text only — never execute JS or render in DOM |
| DoS | Limit response size (5MB), timeout (10s), rate limit (10 req/min per IP) |
| Open redirect | Don't follow redirects to private IPs, max 3 redirects |

### API Key Security

- Store in localStorage (client-side only)
- Never send to serverless functions
- Standard React XSS protections

### Content Security

- Sanitize user text before including in exports
- Validate image uploads by magic bytes
- Process images via Canvas API (strips metadata)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Bundler | Vite |
| Styling | Tailwind CSS |
| Serverless | Vercel Functions |
| AI | OpenAI GPT-4o Vision API |
| Storage | localStorage (MVP) |

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Canvas.tsx
│   │   └── Toolbar.tsx
│   ├── extract/
│   │   ├── ImageUploader.tsx
│   │   ├── UrlInput.tsx
│   │   └── DesignFormatPicker.tsx
│   ├── palette/
│   │   ├── ColorPalette.tsx
│   │   ├── ColorEditor.tsx
│   │   └── KeywordTags.tsx
│   ├── templates/
│   │   ├── TemplateGrid.tsx
│   │   ├── TemplatePreview.tsx
│   │   └── AnimationControls.tsx
│   └── export/
│       └── ExportPanel.tsx
├── hooks/
│   ├── useColorExtraction.ts
│   ├── useAIAnalysis.ts
│   └── useLocalStorage.ts
├── services/
│   ├── colorExtractor.ts
│   └── aiAnalyzer.ts
├── templates/
│   ├── buttons.ts
│   ├── cards.ts
│   ├── heroes.ts
│   ├── footers.ts
│   └── backgrounds.ts
├── types/
│   └── index.ts
├── context/
│   └── AppContext.tsx
└── api/
    └── fetch-url.ts
```

## Future Enhancements (Post-MVP)

- User accounts with cloud storage
- More design format options in dropdown
- Tailwind config export
- React component export
- Download as .zip
- Screenshot capture for URL analysis (Puppeteer)
- More template categories
