# AI PRD Creator - Project Instructions & Guidelines

## 🚀 Project Overview

**AI PRD Creator** is an intelligent web application built to generate Product Requirements Documents (PRDs) from simple ideas using Google's Gemini AI. It provides a guided, wizard-based interface for users to enter requirements and outputs comprehensive, professional PRDs.

### 🛠️ Core Technologies

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4) leveraging a "Compact Neo-Brutalism" design system
- **AI Integration:** Google Gemini API (`@google/genai`)
- **UI Components:** Radix UI primitives and Lucide React icons
- **State/Storage:** IndexedDB (`idb` library) for draft management; localStorage for API keys
- **PWA:** Fully offline-capable Progressive Web App using `next-pwa`

## 🏗️ Architecture & Data Flow

- **Client-Side Storage Approach:** API keys are provided by the user in the browser UI, stored locally via `localStorage`, and passed securely in request payloads to the Next.js API routes (`src/app/api/*`). There is strictly no server-side key logging or backend environment variable requirement.
- **App Structure:** Standard App Router layout.
  - `src/app/api`: Contains endpoints for fetching models (`/models`), prefilling forms (`/prefill`), generating PRDs (`/generate`), and refining sections (`/refine`).
  - `src/components`: UI elements, form widgets, modals, and PRD display viewers.
  - `src/lib`: Core logic including the Gemini client wrappers, prompt builders (`prompt.ts`), PRD interfaces (`prd.ts`), and draft management (`drafts.ts`).

## 💻 Building and Running

Use `npm` for dependency management and script execution.

- **Start Development Server:**

  ```bash
  npm run dev
  ```

  _(Note: Uses Next.js with Webpack instead of Turbopack by default based on package.json)_

- **Build for Production:**

  ```bash
  npm run build
  ```

- **Start Production Server:**

  ```bash
  npm start
  ```

- **Linting & Formatting:**
  ```bash
  npm run lint          # Run ESLint
  npm run format        # Auto-format codebase using Prettier
  npm run format:check  # Check formatting
  ```

## 📐 Development Conventions

- **TypeScript:** Strict mode is enabled. Use robust typing for all API inputs/outputs and component props.
- **Component Design:** Components should follow a highly functional, accessible approach using Radix UI primitives. Maintain the Neo-Brutalism aesthetic (defined in `src/app/globals.css` and Tailwind classes).
- **Styling:** Utilize Tailwind v4 utility classes. Avoid excessive custom CSS unless defining critical CSS variables or design system patterns.
- **Routing:** Adhere strictly to the Next.js App Router paradigm (`page.tsx`, `layout.tsx`, `route.ts`).
- **AI Prompts:** When modifying prompt engineering files (e.g., `src/lib/prompt.ts`, `src/app/api/prefill/route.ts`), ensure JSON schemas remain strongly typed and resilient. Always maintain the inclusion of the current date/time context.
- **Formatting:** Use Prettier to keep code styling consistent across `.ts`, `.tsx`, and `.css` files. Ensure you run `npm run format` before finalizing commits.
