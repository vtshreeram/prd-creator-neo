# AI PRD Creator - Project Instructions & Guidelines

## 🚀 Project Overview

**AI PRD Creator** is an intelligent web application built to generate highly detailed, 29-module Product Requirements Documents (PRDs) from simple ideas using Google's Gemini AI. It provides a guided, fluid-layout workspace for users to enter requirements, answer clarification questions, and output professional PRDs suitable for immediate engineering handoff.

### 🛠️ Core Technologies

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4) utilizing a clean, minimalist `shadcn/ui` inspired design system.
- **AI Integration:** Google Gemini API (`@google/genai`)
- **UI Components:** Radix UI primitives and Lucide React icons
- **State/Storage:** IndexedDB (`idb` library) for robust draft management; `localStorage` for API keys.
- **Export Formats:** Markdown, PDF (`window.print()`), and Word Docs (`docx` library).

## 🏗️ Architecture & Data Flow

- **Client-Side Storage Approach:** API keys are provided by the user in the browser UI, stored locally via `localStorage`, and passed securely in request payloads to the Next.js API routes (`src/app/api/*`). There is strictly no server-side key logging or backend environment variable requirement.
- **Workspace Layout:** The main interaction occurs in `src/components/prd-wizard.tsx`, which uses a fluid two-column layout (Left Sidebar for navigation, Right Panel for active forms/content).
- **App Structure:** Standard App Router layout.
  - `src/app/api`: Contains endpoints for fetching models (`/models`), generating clarification questions (`/clarify`), auto-filling answers (`/autofill-answers`), prefilling forms (`/prefill`), generating full PRDs (`/generate`), refining specific sections (`/refine`), and full-document AI chat editing (`/chat`).
  - `src/components`: UI elements, form widgets, modals, and the comprehensive PRD workspace viewer (`full-page-prd-viewer.tsx`).
  - `src/lib`: Core logic including Gemini client wrappers, prompt builders (`prompt.ts`), 29-module PRD interface schemas (`prd.ts`), draft management (`drafts.ts`), and document export utilities (`export.ts`).

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
- **Component Design:** Components follow a clean, minimalist `shadcn/ui` aesthetic (rounded corners, subtle borders, soft shadows, readable typography). Do not introduce heavy, brutalist, or neon designs. 
- **Styling:** Utilize Tailwind v4 utility classes combined with `clsx` and `tailwind-merge` in the `cn()` utility (`src/lib/utils.ts`) for flexible class composition.
- **Routing:** Adhere strictly to the Next.js App Router paradigm (`page.tsx`, `layout.tsx`, `route.ts`).
- **AI Prompts:** When modifying prompt engineering files (e.g., `src/lib/prd.ts`, `src/app/api/chat/route.ts`), ensure JSON schemas remain strongly typed and resilient. The system relies on strict structural compliance (e.g., the exact 29-module markdown headers).
- **Formatting:** Use Prettier to keep code styling consistent across `.ts`, `.tsx`, and `.css` files. Ensure you run `npm run format` before finalizing commits.
