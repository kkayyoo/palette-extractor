# Portfolio React Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Kay Qiu's portfolio site as a Vite + React + TypeScript + Tailwind CSS single-page app with a warm & creative visual style.

**Architecture:** Single scrollable page, all content driven from typed data files in `src/data/`. Components are split by responsibility: layout (Navbar, Footer), sections (one per page section), and UI primitives (Card, SectionHeader, Badge, IconLink). No routing library — smooth-scroll anchor links only.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Tailwind CSS v3, Devicon (CDN), Font Awesome (CDN), Inter (Google Fonts)

**Spec:** `docs/superpowers/specs/2026-03-23-portfolio-react-rebuild-design.md`

---

## File Map

| File | Responsibility |
|------|---------------|
| `vite.config.ts` | Vite config (base path for GitHub Pages) |
| `tailwind.config.ts` | Custom color tokens, font |
| `src/index.css` | Tailwind directives, global scroll-behavior |
| `src/types/index.ts` | Project, Skill, Experience, HobbyBlock interfaces |
| `src/data/projects.ts` | 12 client projects |
| `src/data/skills.ts` | 8 skills with devicon class names |
| `src/data/experience.ts` | Empty typed array (user populates) |
| `src/data/hobbies.ts` | 3 hobby blocks (text pre-populated, image paths stubbed) |
| `src/components/ui/SectionHeader.tsx` | Reusable section title + accent underline |
| `src/components/ui/Card.tsx` | Reusable card surface with hover lift |
| `src/components/ui/Badge.tsx` | Small pill label (platform, award) |
| `src/components/ui/IconLink.tsx` | Icon + label link (Contact section) |
| `src/components/layout/Navbar.tsx` | Sticky nav, active-section highlight, mobile drawer |
| `src/components/layout/Footer.tsx` | Footer with smile icon |
| `src/hooks/useActiveSection.ts` | IntersectionObserver hook → returns active section id |
| `src/hooks/useInView.ts` | IntersectionObserver hook → triggers fade-in-up on entry |
| `src/components/sections/Hero.tsx` | Full-viewport hero |
| `src/components/sections/About.tsx` | Two-column about |
| `src/components/sections/Portfolio.tsx` | Project card grid |
| `src/components/sections/Skills.tsx` | Skill icon grid |
| `src/components/sections/Experience.tsx` | Vertical timeline (graceful empty state) |
| `src/components/sections/Hobbies.tsx` | Three hobby blocks |
| `src/components/sections/Contact.tsx` | Four contact icon cards |
| `src/App.tsx` | Renders all sections in order |
| `src/main.tsx` | React root mount |

---

## Task 1: Scaffold the Vite project

**Files:**
- Create: (new repo directory, e.g. `~/projects/kay-portfolio/`)
- Modify: `vite.config.ts`, `tailwind.config.ts`, `src/index.css`

- [ ] **Step 1: Create the Vite project**

```bash
npm create vite@latest kay-portfolio -- --template react-ts
cd kay-portfolio
npm install
```

- [ ] **Step 2: Install Tailwind CSS**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p --ts
```

- [ ] **Step 3: Configure Tailwind content paths and custom theme**

Replace `tailwind.config.ts` with:

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#fdf6ee',
        surface: '#ffffff',
        'text-primary': '#2d2d2d',
        'text-muted': '#b08070',
        accent: '#e07a5f',
        'accent-light': '#fce8e2',
        border: '#f0e8e0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 4: Set up global CSS**

Replace `src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

html {
  scroll-behavior: smooth;
}

body {
  background-color: #fdf6ee;
  color: #2d2d2d;
  font-family: 'Inter', system-ui, sans-serif;
}
```

- [ ] **Step 5: Add CDN links to `index.html`**

In `index.html`, add inside `<head>`:

```html
<!-- Devicon -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css">
<!-- Font Awesome -->
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.15.4/css/all.css">
```

- [ ] **Step 6: Clear boilerplate**

Replace `src/App.tsx` with:

```tsx
export default function App() {
  return <div>Kay Portfolio</div>
}
```

Replace `src/main.tsx` with:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```

Expected: browser shows "Kay Portfolio" text on warm off-white background (`#fdf6ee`). No console errors.

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Vite + React + TypeScript + Tailwind project"
```

---

## Task 2: Types and data files

**Files:**
- Create: `src/types/index.ts`
- Create: `src/data/projects.ts`
- Create: `src/data/skills.ts`
- Create: `src/data/experience.ts`
- Create: `src/data/hobbies.ts`

- [ ] **Step 1: Write `src/types/index.ts`**

```ts
export interface Project {
  name: string
  logo: string        // filename only, e.g. "fage.svg"
  platform: string
  role: string
  award?: string
  url: string
}

export interface Skill {
  name: string
  icon: string        // devicon CSS class, e.g. "devicon-react-original colored"
}

export interface Experience {
  company: string
  role: string
  period: string
  description: string
}

export interface HobbyBlock {
  title: string
  highlights: string[]
  description: string
  images: string[]    // filenames in src/assets/images/about/
}
```

- [ ] **Step 2: Write `src/data/projects.ts`**

```ts
import type { Project } from '../types'

export const projects: Project[] = [
  { name: 'Fage', logo: 'fage.svg', platform: 'Drupal 8', role: 'Front-end Lead', url: 'https://usa.fage/' },
  { name: 'Boston Digital', logo: 'bd.jpg', platform: 'Drupal 8 – website redesign', role: 'Main Front-end Developer', url: 'https://www.bostoninteractive.com/' },
  { name: 'Valley', logo: 'valley.png', platform: '', role: 'Front-end Lead', award: 'Gold MarCom Award', url: 'https://www.valley.com/' },
  { name: 'Cambridge Trust', logo: 'ct.svg', platform: 'Kentico', role: 'Main Front-end Developer', award: 'Kentico Top 10 Websites Oct 2018', url: 'https://www.cambridgetrust.com/' },
  { name: 'Allways Health Partners', logo: 'allways.svg', platform: 'Kentico', role: 'Front-end Lead', url: 'https://www.allwayshealthpartners.org/' },
  { name: 'The Guild for Human Services', logo: 'guild.png', platform: '', role: 'Front-end Lead', award: 'AAA compliant website', url: 'https://www.guildhumanservices.org/' },
  { name: 'L.E.K Consulting', logo: 'lek.svg', platform: '', role: 'Front-end Developer', award: 'Consulting Standard of Excellence (WebAwards)', url: 'https://www.lek.com/' },
  { name: 'Charles River Labs', logo: 'crl.svg', platform: '', role: 'Front-end Developer', award: 'Outstanding Website (WebAwards)', url: 'https://www.criver.com/' },
  { name: 'The Andover Companies', logo: 'andover.svg', platform: 'Drupal 8', role: 'Front-end Developer', url: 'https://www.andovercompanies.com/' },
  { name: 'Reputation Institute', logo: 'ri.png', platform: 'Drupal 8', role: 'Main Front-end Developer', url: 'https://www.reputationinstitute.com/' },
  { name: 'Musculoskeletal Clinical Regulatory Advisers', logo: 'mcra.svg', platform: 'Drupal 8', role: 'Main Front-end Developer', url: 'https://www.mcra.com/' },
  { name: 'Zambezi Grace', logo: 'zambezi.jpg', platform: 'Shopify', role: 'Main Front-end Developer', url: 'https://zambezigrace.com/' },
]
```

- [ ] **Step 3: Write `src/data/skills.ts`**

```ts
import type { Skill } from '../types'

export const skills: Skill[] = [
  { name: 'React', icon: 'devicon-react-original colored' },
  { name: 'TypeScript', icon: 'devicon-typescript-plain colored' },
  { name: 'Tailwind CSS', icon: 'devicon-tailwindcss-plain colored' },
  { name: 'Next.js', icon: 'devicon-nextjs-plain' },
  { name: 'Node.js', icon: 'devicon-nodejs-plain colored' },
  { name: 'Jest', icon: 'devicon-jest-plain colored' },
  { name: 'Figma', icon: 'devicon-figma-plain colored' },
  { name: 'Git', icon: 'devicon-git-plain colored' },
]
```

- [ ] **Step 4: Write `src/data/experience.ts`**

```ts
import type { Experience } from '../types'

// TODO: populate with your work history
export const experience: Experience[] = []
```

- [ ] **Step 5: Write `src/data/hobbies.ts`**

```ts
import type { HobbyBlock } from '../types'

export const hobbies: HobbyBlock[] = [
  {
    title: 'Enjoy Meetups, HACKATHON & Tech Conferences',
    highlights: ['ANGELHACK — LADY\'S PROBLEM HACKATHON'],
    description: 'Created a safety tracking app called Running Angel in two days. Keep learning latest & interesting stuff.',
    // TODO: copy images/about/code.jpg and images/about/drupal.jpg from old repo to src/assets/images/about/
    images: ['code.jpg', 'drupal.jpg'],
  },
  {
    title: 'Being a Volunteer',
    highlights: ['UXPA Volunteer — 2016', 'Volunteer of \'Walk for Hunger\' — 2015'],
    description: 'Being a volunteer is meaningful to me. It is not only helping people, but also a way to make me get involved in the community.',
    // TODO: copy images/about/uxpa.jpg from old repo to src/assets/images/about/
    images: ['uxpa.jpg'],
  },
  {
    title: 'Love Running, Snowboarding & Traveling',
    highlights: ['B.A.A. 10K: 2015 – 2018'],
    description: 'Running and jogging help me stay healthy and relax. I love traveling and experiencing different cultures & food.',
    // TODO: copy images/about/10k.jpg and images/about/snowboarding.jpg from old repo to src/assets/images/about/
    images: ['10k.jpg', 'snowboarding.jpg'],
  },
]
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/types src/data
git commit -m "feat: add TypeScript interfaces and pre-populated data files"
```

---

## Task 3: UI primitives

**Files:**
- Create: `src/components/ui/SectionHeader.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/IconLink.tsx`

- [ ] **Step 1: Write `SectionHeader.tsx`**

```tsx
interface SectionHeaderProps {
  title: string
  subtitle?: string
}

export default function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-[#2d2d2d] mb-2">{title}</h2>
      <div className="h-0.5 w-10 bg-accent mb-3" />
      {subtitle && <p className="text-[#b08070]">{subtitle}</p>}
    </div>
  )
}
```

- [ ] **Step 2: Write `Card.tsx`**

```tsx
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-[#f0e8e0] hover:shadow-md transition-shadow duration-200 ${className}`}>
      {children}
    </div>
  )
}
```

- [ ] **Step 3: Write `Badge.tsx`**

```tsx
interface BadgeProps {
  label: string
}

export default function Badge({ label }: BadgeProps) {
  return (
    <span className="inline-block bg-[#fce8e2] text-[#c0614a] text-xs font-medium px-2 py-0.5 rounded">
      {label}
    </span>
  )
}
```

- [ ] **Step 4: Write `IconLink.tsx`**

```tsx
interface IconLinkProps {
  icon: string        // Font Awesome class, e.g. "far fa-envelope"
  label: string
  href?: string       // optional — omit for email display
}

export default function IconLink({ icon, label, href }: IconLinkProps) {
  const inner = (
    <>
      <span className="text-3xl text-accent mb-3 block">
        <i className={icon} />
      </span>
      <p className="text-sm font-medium text-[#2d2d2d]">{label}</p>
    </>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-center hover:opacity-75 transition-opacity">
        {inner}
      </a>
    )
  }

  return <div className="flex flex-col items-center text-center">{inner}</div>
}
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui
git commit -m "feat: add UI primitive components (SectionHeader, Card, Badge, IconLink)"
```

---

## Task 4: IntersectionObserver hooks

**Files:**
- Create: `src/hooks/useActiveSection.ts`
- Create: `src/hooks/useInView.ts`

- [ ] **Step 1: Write `useActiveSection.ts`**

This hook watches multiple section elements and returns the id of the one currently most visible.

```ts
import { useEffect, useState } from 'react'

export function useActiveSection(sectionIds: string[]): string {
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id)
        },
        { rootMargin: '-40% 0px -55% 0px' }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [sectionIds])

  return activeId
}
```

- [ ] **Step 2: Write `useInView.ts`**

This hook returns a `ref` to attach to an element, and a boolean `inView` that becomes true once the element enters the viewport. Used to trigger fade-in-up animations.

```ts
import { useEffect, useRef, useState } from 'react'

export function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks
git commit -m "feat: add useActiveSection and useInView hooks"
```

---

## Task 5: Navbar and Footer

**Files:**
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Write `Navbar.tsx`**

```tsx
import { useState } from 'react'
import { useActiveSection } from '../../hooks/useActiveSection'

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
]

const SECTION_IDS = NAV_LINKS.map((l) => l.href.slice(1))

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const activeId = useActiveSection(SECTION_IDS)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#fdf6ee]/90 backdrop-blur-sm border-b border-[#f0e8e0]">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="text-xl font-bold text-[#2d2d2d] tracking-tight">
          Kay.Yo
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${
                activeId === href.slice(1)
                  ? 'text-accent'
                  : 'text-[#b08070] hover:text-[#2d2d2d]'
              }`}
            >
              {label}
            </a>
          ))}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-accent border border-accent px-3 py-1 rounded hover:bg-accent-light transition-colors"
          >
            Resume
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className="block w-6 h-0.5 bg-[#2d2d2d]" />
          <span className="block w-6 h-0.5 bg-[#2d2d2d]" />
          <span className="block w-6 h-0.5 bg-[#2d2d2d]" />
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-[#fdf6ee] border-t border-[#f0e8e0] px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-[#2d2d2d]"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-accent"
            onClick={() => setMenuOpen(false)}
          >
            Resume
          </a>
        </div>
      )}
    </header>
  )
}
```

- [ ] **Step 2: Write `Footer.tsx`**

```tsx
export default function Footer() {
  return (
    <footer className="py-10 text-center text-[#b08070] text-sm border-t border-[#f0e8e0]">
      <i className="far fa-smile-wink mr-2" />
      Thank you for visiting!
    </footer>
  )
}
```

- [ ] **Step 3: Wire into `App.tsx` temporarily to verify render**

```tsx
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

export default function App() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="h-screen flex items-center justify-center text-[#b08070]">Sections coming soon</div>
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 4: Run dev server and visually verify**

```bash
npm run dev
```

Expected: sticky navbar with logo and links visible, "Kay.Yo" logo on left, nav links on right (desktop). Mobile: hamburger shows drawer. Footer shows at bottom.

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/components/layout src/App.tsx
git commit -m "feat: add Navbar and Footer layout components"
```

---

## Task 6: Hero section

**Files:**
- Create: `src/components/sections/Hero.tsx`

- [ ] **Step 1: Write `Hero.tsx`**

```tsx
export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-2xl">
        <p className="text-sm uppercase tracking-widest text-[#b08070] mb-4">Front End Engineer</p>
        <h1 className="text-5xl md:text-6xl font-bold text-[#2d2d2d] mb-6">
          Hi, I'm Kay
        </h1>
        <p className="text-lg text-[#b08070] mb-10">
          I believe our lives deserve a better combination of modern technologies and human-centered creations.
        </p>
        <a
          href="#portfolio"
          className="inline-block bg-accent text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#c96a50] transition-colors"
        >
          View My Work
        </a>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add Hero to `App.tsx`**

```tsx
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'

export default function App() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <Hero />
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 3: Visual check in dev server**

Expected: full-viewport warm-background hero with bold "Hi, I'm Kay" heading and terracotta CTA button.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Hero.tsx src/App.tsx
git commit -m "feat: add Hero section"
```

---

## Task 7: About section

**Files:**
- Create: `src/components/sections/About.tsx`

- [ ] **Step 1: Write `About.tsx`**

```tsx
import SectionHeader from '../ui/SectionHeader'
import { useInView } from '../../hooks/useInView'

export default function About() {
  const { ref, inView } = useInView()

  return (
    <section
      id="about"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-20 px-6 max-w-5xl mx-auto transition-all duration-700 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <SectionHeader title="Nice to meet you!" subtitle="A little about me" />
      <div className="md:grid md:grid-cols-2 md:gap-12 items-center">
        <p className="text-[#2d2d2d] leading-relaxed text-lg">
          I am a passionate and detail-oriented Front-end Engineer who believes our lives deserve a better combination of modern technologies and human-centered creations.
        </p>
        {/* Photo: add your photo to src/assets/images/profile.jpg to show this column */}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add About to `App.tsx`**

Add `<About />` after `<Hero />` in `main`.

- [ ] **Step 3: Visual check**

Expected: "Nice to meet you!" heading with terracotta underline, bio text, fade-in-up animation on scroll.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/About.tsx src/App.tsx
git commit -m "feat: add About section"
```

---

## Task 8: Portfolio section

**Files:**
- Create: `src/components/sections/Portfolio.tsx`
- Create: `src/assets/images/logos/` (placeholder directory)

- [ ] **Step 1: Copy logo images**

Manually copy all logo files from the old repo (`images/logos/`) into `public/logos/` in the new repo (NOT `src/assets/` — Vite serves `public/` as static files, which is how the component references them via `/logos/filename`). Files needed: `fage.svg`, `bd.jpg`, `valley.png`, `ct.svg`, `allways.svg`, `guild.png`, `lek.svg`, `crl.svg`, `andover.svg`, `ri.png`, `mcra.svg`, `zambezi.jpg`.

If images are not yet available, skip this step — the `onError` handler hides broken images gracefully.

- [ ] **Step 2: Write `Portfolio.tsx`**

```tsx
import { projects } from '../../data/projects'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import SectionHeader from '../ui/SectionHeader'
import { useInView } from '../../hooks/useInView'

export default function Portfolio() {
  const { ref, inView } = useInView()

  return (
    <section
      id="portfolio"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-20 px-6 bg-white transition-all duration-700 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-5xl mx-auto">
        <SectionHeader title="Portfolio" subtitle="My recent work projects — Front-end Engineer @ Boston Digital" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="p-6 h-full flex flex-col gap-3">
                <div className="h-14 flex items-center">
                  <img
                    src={`/logos/${project.logo}`}
                    alt={project.name}
                    className="max-h-12 max-w-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
                <h3 className="font-semibold text-[#2d2d2d] group-hover:text-accent transition-colors">
                  {project.name}
                </h3>
                {project.platform && <Badge label={project.platform} />}
                <p className="text-sm text-[#b08070]">{project.role}</p>
                {project.award && (
                  <p className="text-xs text-[#b08070] italic">{project.award}</p>
                )}
                <span className="mt-auto text-xs font-medium text-accent">View the Site →</span>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
```

Note: images are served from `public/logos/` — copy logo files there so Vite can serve them at `/logos/filename` without import processing.

- [ ] **Step 3: Add Portfolio to `App.tsx`**

- [ ] **Step 4: Visual check**

Expected: 3-column grid of cards with client logos, names, roles. Cards lift on hover. "View the Site →" in terracotta.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Portfolio.tsx src/App.tsx public/logos
git commit -m "feat: add Portfolio section with 12 client project cards"
```

---

## Task 9: Skills section

**Files:**
- Create: `src/components/sections/Skills.tsx`

- [ ] **Step 1: Write `Skills.tsx`**

```tsx
import { skills } from '../../data/skills'
import SectionHeader from '../ui/SectionHeader'
import { useInView } from '../../hooks/useInView'

export default function Skills() {
  const { ref, inView } = useInView()

  return (
    <section
      id="skills"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-20 px-6 transition-all duration-700 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          title="Technical Skills"
          subtitle="I have a huge passion to get involved with up-to-date web tech and practical development tools."
        />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-6 justify-items-center">
          {skills.map((skill) => (
            <div key={skill.name} className="flex flex-col items-center gap-2">
              <i className={`${skill.icon} text-4xl`} />
              <span className="text-xs text-[#b08070] font-medium text-center">{skill.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add Skills to `App.tsx`**

- [ ] **Step 3: Visual check**

Expected: 8 tech icons in a row (desktop) with labels below. Devicon colored icons showing React, TypeScript, Tailwind, Next.js, Node.js, Jest, Figma, Git.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Skills.tsx src/App.tsx
git commit -m "feat: add Skills section with updated 8-skill icon grid"
```

---

## Task 10: Experience section

**Files:**
- Create: `src/components/sections/Experience.tsx`

- [ ] **Step 1: Write `Experience.tsx`**

```tsx
import { experience } from '../../data/experience'
import SectionHeader from '../ui/SectionHeader'
import { useInView } from '../../hooks/useInView'

export default function Experience() {
  const { ref, inView } = useInView()

  return (
    <section
      id="experience"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-20 px-6 bg-white transition-all duration-700 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-3xl mx-auto">
        <SectionHeader title="Experience" />
        {experience.length === 0 ? (
          <p className="text-[#b08070] italic">Coming soon.</p>
        ) : (
          <ol className="relative border-l border-[#f0e8e0]">
            {experience.map((entry, i) => (
              <li key={i} className="mb-10 ml-6">
                <span className="absolute -left-2 w-4 h-4 rounded-full bg-accent border-2 border-white" />
                <p className="text-xs text-[#b08070] mb-1">{entry.period}</p>
                <h3 className="text-lg font-semibold text-[#2d2d2d]">{entry.role}</h3>
                <p className="text-sm text-accent font-medium mb-1">{entry.company}</p>
                <p className="text-sm text-[#2d2d2d]">{entry.description}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add Experience to `App.tsx`**

- [ ] **Step 3: Visual check**

Expected: "Coming soon." placeholder (since `experience.ts` is empty). Terracotta timeline dots when populated.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Experience.tsx src/App.tsx
git commit -m "feat: add Experience timeline section (graceful empty state)"
```

---

## Task 11: Hobbies section

**Files:**
- Create: `src/components/sections/Hobbies.tsx`

- [ ] **Step 1: Copy hobby images (if available)**

Copy `images/about/code.jpg`, `drupal.jpg`, `uxpa.jpg`, `10k.jpg`, `snowboarding.jpg` from the old repo to `public/about/` in the new repo so they're served statically.

- [ ] **Step 2: Write `Hobbies.tsx`**

```tsx
import { hobbies } from '../../data/hobbies'
import SectionHeader from '../ui/SectionHeader'
import { useInView } from '../../hooks/useInView'

export default function Hobbies() {
  const { ref, inView } = useInView()

  return (
    <section
      id="hobbies"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-20 px-6 transition-all duration-700 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-5xl mx-auto">
        <SectionHeader title="Know More About Me" subtitle="There are more fun things not on my resume." />
        <div className="flex flex-col gap-16">
          {hobbies.map((block, i) => (
            <div
              key={block.title}
              className={`flex flex-col md:flex-row gap-10 items-center ${
                i % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#2d2d2d] mb-2">{block.title}</h3>
                {block.highlights.map((h) => (
                  <p key={h} className="text-sm font-semibold text-accent mb-1">{h}</p>
                ))}
                <p className="text-[#2d2d2d] mt-2 leading-relaxed">{block.description}</p>
              </div>
              <div className="flex-1 flex gap-4 flex-wrap">
                {block.images.map((img) => (
                  <img
                    key={img}
                    src={`/about/${img}`}
                    alt={block.title}
                    className="rounded-xl object-cover w-full max-w-xs max-h-56"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Add Hobbies to `App.tsx`**

- [ ] **Step 4: Visual check**

Expected: three alternating text/image blocks. Images hidden gracefully if not yet copied.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Hobbies.tsx src/App.tsx
git commit -m "feat: add Hobbies / Beyond Work section"
```

---

## Task 12: Contact section

**Files:**
- Create: `src/components/sections/Contact.tsx`

- [ ] **Step 1: Write `Contact.tsx`**

```tsx
import SectionHeader from '../ui/SectionHeader'
import IconLink from '../ui/IconLink'
import { useInView } from '../../hooks/useInView'

const CONTACT_ITEMS = [
  { icon: 'far fa-envelope', label: 'kayqiu87@gmail.com' },
  { icon: 'fab fa-github-alt', label: 'Check Out My Code', href: 'https://github.com/kkayyoo' },
  { icon: 'fab fa-codepen', label: 'My Fun Stuff', href: 'http://codepen.io/KayYo' },
  { icon: 'fab fa-linkedin-in', label: 'Connect on LinkedIn', href: 'https://www.linkedin.com/in/yaqiqiu' },
]

export default function Contact() {
  const { ref, inView } = useInView()

  return (
    <section
      id="contact"
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-20 px-6 bg-white transition-all duration-700 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-5xl mx-auto">
        <SectionHeader title="Contact Me" subtitle="Want to talk? Send me an email." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {CONTACT_ITEMS.map((item) => (
            <IconLink key={item.label} {...item} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add Contact to `App.tsx`**

Final `App.tsx` should render all sections in order:

```tsx
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Portfolio from './components/sections/Portfolio'
import Skills from './components/sections/Skills'
import Experience from './components/sections/Experience'
import Hobbies from './components/sections/Hobbies'
import Contact from './components/sections/Contact'

export default function App() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <Hero />
        <About />
        <Portfolio />
        <Skills />
        <Experience />
        <Hobbies />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 3: Visual check**

Expected: four contact icon cards (email, GitHub, CodePen, LinkedIn) in terracotta accent.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/Contact.tsx src/App.tsx
git commit -m "feat: add Contact section and complete App.tsx with all sections"
```

---

## Task 13: Final polish and full build verification

**Files:**
- Modify: `index.html` (title, favicon)
- Modify: `vite.config.ts` (base path if deploying to GitHub Pages subfolder)

- [ ] **Step 1: Update page title and meta in `index.html`**

```html
<title>Kay Qiu — Front End Engineer</title>
<meta name="description" content="Kay Qiu's portfolio — Front End Engineer specializing in React, TypeScript, and Tailwind CSS.">
```

- [ ] **Step 2: Full end-to-end visual walkthrough in dev server**

Check each section:
- Hero: full-viewport, CTA button scrolls to Portfolio
- Navbar: active link highlights as you scroll through sections
- Mobile: hamburger opens/closes drawer, links close drawer on click
- Portfolio: 12 cards in grid, hover lift, external links open in new tab
- Skills: 8 devicon icons with labels
- Experience: "Coming soon." placeholder
- Hobbies: 3 alternating blocks, images load (or hide gracefully)
- Contact: 4 icon cards, links open in new tab

- [ ] **Step 3: Run production build**

```bash
npm run build
```

Expected: `dist/` folder created, no build errors, no TypeScript errors.

- [ ] **Step 4: Preview production build**

```bash
npm run preview
```

Expected: production build serves correctly at `http://localhost:4173`. All sections look identical to dev build.

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete portfolio rebuild — all sections, polish, and production build verified"
```

---

## Post-Implementation Manual Steps

These require user action outside the code:

1. **Copy logo images** from old repo `images/logos/` → `public/logos/` in new repo
2. **Copy about images** from old repo `images/about/` → `public/about/` in new repo
3. **Add resume PDF** — place your resume at `public/resume.pdf`
4. **Populate experience data** — edit `src/data/experience.ts` with your work history
5. **Create new GitHub repository** and push the new project
6. **Configure deployment** (GitHub Pages, Netlify, Vercel, etc.) — out of scope for this plan
