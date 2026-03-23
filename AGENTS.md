# AGENTS.md - PRD Creator Codebase Guide

## Project Overview

PRD Creator is a Next.js 16 (App Router) application that generates Product Requirements Documents using Google's Gemini AI. It uses a Neo-Brutalism design system with Tailwind CSS v4.

**Tech Stack:**

- Next.js 16 with App Router
- React 19
- TypeScript (strict mode)
- Tailwind CSS v4 (CSS-first configuration)
- IndexedDB (via `idb`) for draft persistence
- `@google/genai` for Gemini API calls
- PWA support via `@ducanh2912/next-pwa`

---

## Build / Lint / Format Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000

# Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint on the project

# Formatting
npm run format       # Format all files with Prettier (writes)
npm run format:check # Check formatting without writing

# No test framework is currently configured
```

### Running a Single Test

Tests are not configured for this project.

---

## Code Style Guidelines

### General

- **2-space indentation**, no tabs
- **LF line endings**
- **Single quotes** for JS/TS strings
- **Semicolons** at the end of statements
- **Trailing commas**: none
- **Print width**: 80 characters
- **Arrow functions**: always use parentheses around arguments (`(x) => x`)

### TypeScript

- **`strict: true`** is enabled in `tsconfig.json` — no implicit any, strict null checks
- Define interfaces for all component props and API payloads
- Use `Record<key, value>` for dictionary types
- Avoid `any` — use `unknown` when type is truly unknown, then narrow
- Use `type` for simple type aliases, `interface` for object shapes
- Validate external data (API payloads) with type guards

### React / Next.js

- Client components: include `'use client';` at the top of the file
- Server components: no directive needed (default in App Router)
- Use `React.FC` or inline function typing — avoid `React.ReactNode` as default prop
- Prefer `useState<type>()` with explicit generic when state type isn't obvious
- Use `Readonly<{...}>` for layout props
- No default exports for page components — use named exports

### Imports

Organize imports in this order (Prettier/ESLint will sort via `prettier-plugin-tailwindcss`):

1. React / built-in imports
2. Third-party libraries
3. `@/` path aliases (src modules)
4. Relative imports (`./`, `../`)

```typescript
import { useState } from 'react';
import { clsx } from 'clsx';
import { Button } from '@/components/button';
import { prd } from '../lib/prd';
```

### Naming Conventions

| Type              | Convention            | Example                        |
| ----------------- | --------------------- | ------------------------------ |
| Components        | PascalCase            | `PRDWizard`, `SettingsModal`   |
| Hooks             | camelCase + `use`     | `useLocalStorage`, `useDrafts` |
| Utility functions | camelCase             | `sanitizeIngestForStorage`     |
| Types/Interfaces  | PascalCase            | `PrdInput`, `StoredDraft`      |
| Constants         | SCREAMING_SNAKE       | `MAX_DRAFTS`, `DB_NAME`        |
| CSS classes       | kebab-case (Tailwind) | `shadow-base`, `neo-border`    |

### Error Handling

- Use `try/catch` blocks around async operations
- Always narrow `unknown` errors before returning:
  ```typescript
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
  ```
- For API routes: return `NextResponse.json` with appropriate HTTP status codes
- Client-side: handle loading and error states explicitly

### API Routes (`src/app/api/`)

- Place shared utilities in `src/app/api/_lib/`
- Validate request body with type guards before processing
- Return structured JSON: `{ data: ... }` for success, `{ error: ... }` for failures
- Use named exports for route handlers (`export async function POST`)

---

## Project Structure

```
src/
├── app/                      # Next.js App Router pages/routes
│   ├── api/                  # API routes
│   │   ├── _lib/             # Shared API utilities
│   │   │   ├── gemini-client.ts
│   │   │   └── datetime.ts
│   │   ├── generate/route.ts
│   │   ├── refine/route.ts
│   │   ├── models/route.ts
│   │   └── prefill/route.ts
│   ├── layout.tsx            # Root layout with fonts/metadata
│   ├── page.tsx              # Home page (client component)
│   └── globals.css           # Tailwind + custom styles
├── components/               # React components
│   ├── button.tsx
│   ├── prd-form.tsx
│   ├── prd-wizard.tsx
│   └── ...
├── lib/                      # Business logic
│   ├── prd.ts                # PRD types, prompts
│   ├── drafts.ts             # IndexedDB persistence
│   ├── models.ts             # Model utilities
│   └── ingest.ts             # File ingestion
└── types/                    # Type declarations
    └── next-pwa.d.ts
```

### Path Aliases

`@/*` is mapped to `src/*` in `tsconfig.json`:

```typescript
import { Button } from '@/components/button'; // src/components/button.tsx
```

---

## Tailwind CSS v4

This project uses **Tailwind CSS v4** with the CSS-first configuration approach:

```css
@import 'tailwindcss';
```

- Custom CSS variables are defined in `globals.css` under `:root`
- `@theme inline` block exposes CSS vars as Tailwind utilities
- Neo-Brutalism design tokens (borders, shadows, colors) are in `globals.css`
- Utility classes: `neo-border`, `neo-shadow`, `neo-hover-lift`, `neo-content-scrollable`

---

## Key Libraries

| Library                  | Purpose                       |
| ------------------------ | ----------------------------- |
| `@google/genai`          | Gemini AI client              |
| `@radix-ui/react-dialog` | Modal dialogs                 |
| `idb`                    | IndexedDB wrapper             |
| `lucide-react`           | Icons                         |
| `react-markdown`         | Markdown rendering            |
| `remark-gfm`             | GitHub Flavored Markdown      |
| `clsx`                   | Conditional className merging |

---

## Environment Variables

| Variable                | Description                         |
| ----------------------- | ----------------------------------- |
| `GEMINI_API_KEY`        | Google Gemini API key (server-side) |
| `GOOGLE_GEMINI_API_KEY` | Alternative env var name            |
| `API_KEY`               | Fallback env var name               |
| `NEXT_PUBLIC_SITE_URL`  | Public site URL for metadata        |

---

## Design System (Neo-Brutalism)

- **Borders**: 2-3px solid black, zero border-radius
- **Shadows**: Hard offset shadows (`box-shadow: 6px 6px 0px #000`)
- **Primary color**: `#FFEB3B` (yellow)
- **Secondary color**: `#2196F3` (blue)
- **Typography**: Big Shoulders Display (headings), Inter (body)
- **Hover effects**: translate + larger shadow

---

## ESLint Configuration

Extends `next/core-web-vitals` and `next/typescript`. The following are ignored:

- `node_modules/**`, `.next/**`, `out/**`, `build/**`
- `public/**`, `**/*.js`, `**/*.d.ts`
- `next-env.d.ts`, `.playwright-mcp/**`

The `@next/next/no-img-element` rule is **disabled** (next/image is not used).

---

## EditorConfig

Settings are in `.editorconfig` — 2-space indent, LF line endings, UTF-8 charset, trim trailing whitespace, insert final newline.

## Prettier Configuration

Plugins: `prettier-plugin-tailwindcss` (auto-sorts Tailwind classes). Formatted files are ignored in `.prettierignore` (node*modules, build, .next, public, *.log, lock files, .env\_, etc.).
