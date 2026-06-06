# Ikigai

A mobile-first PWA to help you **find and follow your ikigai** — the Japanese concept of a "reason for being," found where four parts of your life overlap:

- ❤️ **What you love**
- ⭐ **What you're good at**
- 🌍 **What the world needs**
- 💰 **What you can be paid for**

Where all four meet is your _ikigai_.

## Features (current)

- **Discover flow** (`/discover`) — brainstorm activities, then rate each one across the four dimensions in a guided, mobile-friendly wizard.
- **Ikigai map** (`/map`) — a four-circle Venn visualization that sorts your activities into overlaps (Passion, Mission, Profession, Vocation) and surfaces your **ikigai candidates**.
- **Local-first** — everything is stored in your browser via `localStorage`; no account required.
- **Installable PWA** — web app manifest, icon, theme color, and an offline-capable service worker.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, React Compiler)
- [Tailwind CSS v4](https://tailwindcss.com/)
- Deployed on [Netlify](https://docs.netlify.com/frameworks/next-js/overview/)

## Developing locally

```bash
npm install
npm run dev
```

Then open [localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run lint    # ESLint (flat config)
```

## Roadmap

- **Follow your ikigai** — turn your map into goals, habits, and check-ins.
- AI "ikigai coach" for reflective prompts and theme-spotting.
- Optional accounts + cloud sync across devices.

## Project structure

```
app/
  page.jsx          # landing
  discover/page.jsx # the discovery wizard
  map/page.jsx      # the ikigai map
  manifest.js       # PWA manifest
components/
  app-header.jsx
  sw-register.jsx
  ikigai/           # mark + venn visualization
lib/
  ikigai.js         # model + region logic
  use-ikigai.js     # local-first store (useSyncExternalStore)
```
