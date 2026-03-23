# Portfolio React Rebuild — Design Spec

**Date:** 2026-03-23  
**Author:** Kay Qiu  
**Status:** Approved

---

## Overview

Rebuild the existing portfolio site (`kkayyoo.github.io`) from scratch using React, TypeScript, and Tailwind CSS. The goals are twofold: refresh the content to reflect the current tech stack, and demonstrate modern front-end engineering practices through the site itself.

The rebuild will live in a **new GitHub repository** (separate from the existing site, which remains intact).

---

## Goals

- Replace the old Foundation CSS / jQuery / SCSS / Gulp site with a modern React + TypeScript + Tailwind SPA
- Update content: new skills list, same client project portfolio (12 projects from Boston Digital)
- Warm & Creative visual style: off-white background, terracotta/coral accent color
- Single-page application with smooth-scroll anchor navigation
- Fully responsive (mobile-first)

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Scaffolding | Vite (React + TypeScript template) |
| UI Framework | React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Fonts | Inter (Google Fonts) |
| Icons | Devicon (CDN) + Font Awesome (CDN) |
| Deployment | New GitHub repository (Pages or other static host, configured separately) |

---

## Visual Design

### Color Palette

Defined as custom Tailwind theme tokens in `tailwind.config.ts`:

```
background:   #fdf6ee  (warm off-white)
surface:      #ffffff
text-primary: #2d2d2d
text-muted:   #b08070
accent:       #e07a5f  (terracotta/coral)
accent-light: #fce8e2
border:       #f0e8e0
```

### Typography

- Font family: Inter (loaded via Google Fonts)
- Section headings: large, bold, `text-primary`
- Section subtitle/label: `text-muted`, uppercase, letter-spaced
- Accent underline: 2px terracotta bar beneath each section title

### Cards & Surfaces

- Cards: `rounded-xl`, `shadow-sm`, `border border-[#f0e8e0]`
- Hover state: `hover:shadow-md transition` (subtle lift)

### Animations

- Sections fade-in-up on viewport entry via `IntersectionObserver` + Tailwind transition classes
- No heavy animation libraries

---

## Navigation

- **Structure:** Single-page application, all sections on one scrollable page
- **Nav:** Sticky top navbar — logo (`Kay.Yo`) left, anchor links right
  - Links (in page order): About · Portfolio · Skills · Experience · Contact · Resume
  - `Beyond Work` section is intentionally omitted from the navbar (no direct anchor link; reached by scrolling)
  - Resume opens a PDF in a new tab; PDF file placed in `public/resume.pdf` (user provides the file)
  - Active section highlighted via `IntersectionObserver`
- **Mobile:** Hamburger icon toggles a nav drawer
- **Scroll:** Native CSS `scroll-behavior: smooth`

---

## Sections (top to bottom)

### 1. Hero
- Full-viewport section
- Content: `Hi, I'm Kay` (h1), `Front End Engineer` (h3), short tagline
- CTA button: scrolls to Portfolio section
- Background: `#fdf6ee`, CTA button in terracotta accent

### 2. About
- Section id: `#about`
- Two-column layout on desktop (text left, optional photo right), single column on mobile
- Short bio paragraph (carried over from existing site)
- Photo: hardcoded in `About.tsx` as a static import from `src/assets/images/`; if no photo is provided, the right column is omitted gracefully

### 3. Portfolio
- Section id: `#portfolio`
- Grid: 3 columns desktop / 2 tablet / 1 mobile
- 12 client projects from Boston Digital (data-driven)
- Each card: client logo, project name, platform/tech, role, optional award, "View Site" link
- Data source: `src/data/projects.ts`

### 4. Skills
- Section id: `#skills`
- Icon grid using Devicon
- 8 skills: React, TypeScript, Tailwind CSS, Next.js, Node.js, Jest, Figma, Git
- Each item: icon + label
- Data source: `src/data/skills.ts`

### 5. Experience / Timeline
- Section id: `#experience`
- Vertical timeline layout
- Each entry: company, role, date range, brief description
- Data source: `src/data/experience.ts` (user fills in details)

### 6. Beyond Work (Hobbies)
- Section id: `#hobbies` (not linked in the navbar — reached by scrolling only)
- Three content blocks: Hackathons, Volunteering, Running & Travel
- Each block: title, highlights, description, images
- Images migrated from existing repo
- Data source: `src/data/hobbies.ts`

### 7. Contact
- Section id: `#contact`
- Four icon cards with the following links:
  - Email: `kayqiu87@gmail.com`
  - GitHub: `https://github.com/kkayyoo`
  - CodePen: `http://codepen.io/KayYo`
  - LinkedIn: `https://www.linkedin.com/in/yaqiqiu`

### 8. Footer
- Minimal: "Thank you for visiting!" with smile icon

---

## Project Structure

```
src/
  components/
    layout/
      Navbar.tsx
      Footer.tsx
    sections/
      Hero.tsx
      About.tsx
      Portfolio.tsx
      Skills.tsx
      Experience.tsx
      Hobbies.tsx
      Contact.tsx
    ui/
      Card.tsx
      SectionHeader.tsx
      Badge.tsx
      IconLink.tsx
  data/
    projects.ts
    skills.ts
    experience.ts
    hobbies.ts
  types/
    index.ts
  assets/
    images/        # migrated from existing repo
  App.tsx
  main.tsx
  index.css
tailwind.config.ts
vite.config.ts
tsconfig.json
```

---

## TypeScript Interfaces

Defined in `src/types/index.ts`:

```ts
interface Project {
  name: string        // client/project name, e.g. "Fage"
  logo: string        // path relative to assets/
  platform: string    // e.g. "Drupal 8", "Shopify"
  role: string        // e.g. "Front-end Lead"
  award?: string      // optional recognition
  url: string
}

interface Skill {
  name: string
  icon: string        // devicon CSS class name
}

interface Experience {
  company: string
  role: string
  period: string      // e.g. "2016 – 2020"
  description: string
}
// experience.ts is scaffolded as an empty array: export const experience: Experience[] = []
// The Experience section renders gracefully when empty (shows a "coming soon" placeholder message)

interface HobbyBlock {
  title: string
  highlights: string[]
  description: string
  images: string[]    // paths relative to assets/; migrated from old repo images/about/
}
// hobbies.ts is pre-populated with text content from the existing site.
// Image paths are scaffolded as placeholder strings; the actual image files must be
// manually copied from the old repo's images/about/ directory into src/assets/images/about/.
```

---

## Data Files

| File | Content |
|------|---------|
| `src/data/projects.ts` | All 12 client projects pre-populated (source: `kkayyoo.github.io` index.html — data listed below) |
| `src/data/skills.ts` | 8 skills with devicon class names |
| `src/data/experience.ts` | Work history — scaffolded as an empty typed array with a comment; user populates content separately |
| `src/data/hobbies.ts` | 3 hobby blocks from existing site |

---

## Project Data (12 Client Projects)

Pre-populate `src/data/projects.ts` with the following records:

| name | platform | role | award | url |
|------|----------|------|-------|-----|
| Fage | Drupal 8 | Front-end Lead | — | https://usa.fage/ |
| Boston Digital | Drupal 8 – website redesign | Main Front-end Developer | — | https://www.bostoninteractive.com/ |
| Valley | — | Front-end Lead | Gold MarCom Award | https://www.valley.com/ |
| Cambridge Trust | Kentico | Main Front-end Developer | Kentico Top 10 Websites Oct 2018 | https://www.cambridgetrust.com/ |
| Allways Health Partners | Kentico | Front-end Lead | — | https://www.allwayshealthpartners.org/ |
| The Guild for Human Services | — | Front-end Lead | AAA compliant website | https://www.guildhumanservices.org/ |
| L.E.K Consulting | — | Front-end Developer | Consulting Standard of Excellence (WebAwards) | https://www.lek.com/ |
| Charles River Labs | — | Front-end Developer | Outstanding Website (WebAwards) | https://www.criver.com/ |
| The Andover Companies | Drupal 8 | Front-end Developer | — | https://www.andovercompanies.com/ |
| Reputation Institute | Drupal 8 | Main Front-end Developer | — | https://www.reputationinstitute.com/ |
| Musculoskeletal Clinical Regulatory Advisers | Drupal 8 | Main Front-end Developer | — | https://www.mcra.com/ |
| Zambezi Grace | Shopify | Main Front-end Developer | — | https://zambezigrace.com/ |

Logo images for each project are in the existing repo under `images/logos/`. They should be migrated to `src/assets/images/logos/` in the new repo. Filename convention matches the existing filenames (e.g. `fage.svg`, `bd.jpg`, `valley.png` — see the old repo for the exact filenames). The `logo` field in each `Project` record should be the filename only (e.g. `"fage.svg"`), and the component resolves the full path.

`hobbies.ts` images depend on migrating assets from the old repo (`images/about/`); scaffold with placeholder image paths and note that assets must be copied manually.

---

## Out of Scope

- Personal / side projects (not included in portfolio)
- Multi-page routing (single page only)
- Backend / API / CMS
- Deployment pipeline (configured separately after build)
- Dark mode toggle
- Blog or writing section
