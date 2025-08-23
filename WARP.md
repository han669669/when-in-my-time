# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Repository: when-in-my-time (React + Vite + TypeScript + Tailwind CSS v4)

Commands
- Install deps
  - npm ci
  - If first time or lockfile changed: npm install
- Start dev server
  - npm run dev
- Build production bundle
  - npm run build
- Preview production build locally (after build)
  - npm run preview
- Lint (ESLint flat config)
  - npm run lint

Notes on tests
- There is no test runner configured in this repo (no vitest/jest config or scripts). If you add Vitest later, a typical flow would be:
  - npm i -D vitest @vitest/coverage-v8 jsdom
  - npx vitest
  - Run a single test pattern: npx vitest path/to/file.test.ts

Architecture and project structure
- App shell and entry
  - src/main.tsx mounts the React app with StrictMode and imports global styles from src/index.css.
  - src/App.tsx contains the entire UI and business logic for parsing natural-language dates and presenting results.
- Styling and design system
  - Tailwind CSS v4 is used with the new @import "tailwindcss" entry in src/index.css; no PostCSS config file is needed.
  - The project uses shadcn/ui patterns with small UI primitives (src/components/ui/*) and a utility class merger (src/lib/utils.ts with cn()).
  - index.css defines theme CSS variables, a dark variant via @custom-variant, and base layer utilities. It also imports tw-animate-css.
- Build tooling
  - Vite (vite.config.ts) with @vitejs/plugin-react and @tailwindcss/vite. An alias "@" → ./src is defined here and mirrored in tsconfig for IDE support.
  - TypeScript is configured in a project-references layout (tsconfig.json -> tsconfig.app.json & tsconfig.node.json). Bundler mode is enabled.
- Core functionality
  - Natural-language datetime parsing is provided by chrono-node in App.tsx (chrono.parseDate). The result is formatted with Intl.DateTimeFormat and a simple time-delta is computed for the "time left" display.
- Static HTML
  - index.html provides the #root mount and metadata; Vite injects the client in dev.

Conventions and important details
- Imports
  - Use the alias paths (e.g., import { Button } from '@/components/ui/button'). The alias is configured consistently in vite.config.ts and tsconfig.*.json.
- Tailwind v4 specifics
  - Per project rules: use @import "tailwindcss" in CSS and @tailwindcss/vite in Vite config. This repo already follows that pattern; do not add legacy @tailwind directives or a PostCSS config file.
- Linting
  - ESLint uses the flat config (eslint.config.js) with typescript-eslint, react-refresh, and react-hooks. Lint targets **/*.ts,tsx and ignores dist/.

Key files to know
- vite.config.ts: Vite plugins and path alias.
- src/index.css: Tailwind v4 setup, theme tokens, and base styles.
- src/App.tsx: UI + chrono-node parsing logic.
- components.json: shadcn/ui configuration including Tailwind file paths and aliases.

Common tasks for future changes
- Adding a new UI primitive: place it under src/components/ui and export a typed component; reuse cn() from src/lib/utils.ts.
- Using Tailwind tokens: prefer the CSS variables declared in index.css (e.g., --color-primary) via Tailwind utilities that map to them.
- Adding tests later: prefer Vitest with jsdom for React; colocate *.test.tsx next to components and use @ alias in imports.

