# Repository guide

This document describes how the project is structured and how to extend it safely. It is written for **humans and
automated coding agents** (for example Antigravity, Cursor, Claude Code, GitHub Copilot, and similar tools).

## Agent rules and skills

**`@` path composition:** Some coding agents merge lines that start with `@` into project instructions when this
document is loaded. The lines below are the canonical includes for this repo’s rules and skills. If your agent does not
expand `@` inside an already-imported file, repeat the same `@` lines in whatever root instruction file
loads `AGENTS.md`.

@.agents/rules/agents-rules-bridge.md
@.agents/rules/components.md
@.agents/rules/contexts.md
@.agents/rules/hooks.md
@.agents/rules/testing-requirements.md
@.agents/rules/architecture-adrs.md
@.agents/skills/using-agent-skills/SKILL.md
@.agents/skills/frontend-ui-engineering/SKILL.md
@.agents/skills/incremental-implementation/SKILL.md
@.agents/skills/security-and-hardening/SKILL.md

**All coding agents:** Honor the paths above. The **`.agents/rules/agents-rules-bridge.md`** include (first in the list) is the change-area → rule-file map; still open the linked rule files for the code you touch. **Architecture:** follow `.agents/rules/architecture-adrs.md`
for significant, cross-cutting, or hard-to-reverse decisions (ADRs in `docs/adr/`). For skills, open a given `.agents/skills/*/SKILL.md` when
its YAML `description` fits the task—start with `using-agent-skills`. Cursor (and similar) may mirror the same bridge under **`.cursor/rules/`** as a workspace rule; keep it in sync with **`.agents/rules/agents-rules-bridge.md`** or rely on this `AGENTS.md` `@` list only.

## Project overview

**backVR** is a **Next.js** (App Router) app with a **Three.js** panoramic viewer (`VRViewer`), **Firebase** (Firestore telemetry), and **TanStack Query** for discrete client mutations. Styling uses **Tailwind CSS** v4.

## Key principles

### UI

Prefer **Tailwind** for layout and visuals; add **Radix UI** primitives when you need accessible dialogs, menus, or similar (style with Tailwind). Use **Lucide** (`lucide-react`, already in dependencies) for icons.

### Server state

**TanStack Query** wraps the app via `AppQueryProvider` in `src/app/providers.tsx`. High-frequency Firestore writes (e.g. gaze) stay outside mutations where documented in code.

### File naming

Use **kebab-case** for hooks and utilities (`use-telemetry.ts`). React components often use **PascalCase** filenames (`VRViewer.tsx`) to match exports; stay consistent with neighboring files in the same folder.

## Project structure

- `src/app/` — routes, `layout.tsx`, `providers.tsx`, global styles
- `src/components/` — client UI (e.g. viewer)
- `src/hooks/` — client hooks (e.g. `use-telemetry.ts`)
- `src/lib/` — Firebase, Three.js helpers
- `src/types/` — shared TypeScript types
- `docs/adr/` — architecture decision records

## Styling and theming

Tailwind v4 with `src/app/globals.css` and PostCSS. Fonts and root HTML live in `src/app/layout.tsx`.

## Development commands

```bash
npm run dev            # Next.js dev server (default http://localhost:3000)
npm run build          # next build (production)
npm run start          # next start (after build)
npm run test           # Jest (next/jest)
npm run test:watch     # Jest watch mode
npm run test:coverage  # Jest with coverage (CI)
npm run lint           # ESLint
npm run lint:fix       # ESLint --fix
npm run format         # Prettier (write)
npm run format:check   # Prettier (check)
```

E2E is **not** wired yet—see **TODO: Playwright** below.

## Tests

Follow **`.agents/rules/testing-requirements.md`**. New or changed behavior should include appropriate automated tests.

## Architecture decisions (ADRs)

Agents and humans **must** capture significant, cross-cutting, or hard-to-reverse decisions as **ADRs** under **`docs/adr/`**, not only in PR text or chat.

1. Read **`.agents/rules/architecture-adrs.md`** (always-on) and **`docs/adr/README.md`** (“When to add an ADR”).
2. If the change matches those criteria, add **`docs/adr/NNNN-title.md`** from **`docs/adr/TEMPLATE.md`**, bump the sequence number, and **update the index table** in **`docs/adr/README.md`** in the **same PR** as the implementation.
3. For multi-file or high-impact work, follow **`.agents/skills/incremental-implementation/SKILL.md`** and treat “ADR written + indexed” as part of the deliverable, same as tests and a green build.

## TODO: Playwright (E2E)

Playwright is referenced in **`.agents/rules/testing-requirements.md`** and **`.github/workflows/e2e.yml`**, but the app does not yet define `npm run test:e2e` or a Playwright config. Track and complete:

- [ ] Add **`@playwright/test`** as a dev dependency and a **`test:e2e`** script in **`package.json`** (e.g. `playwright test`).
- [ ] Add **`playwright.config.ts`** (base URL, projects, `webServer` for `next dev` or `next start` as appropriate for local + CI).
- [ ] Add an **`e2e/`** directory with at least one smoke spec and align with **`.agents/subagents/playwright-ui.md`**.
- [ ] Verify **`.github/workflows/e2e.yml`** (Node via **`.nvmrc`**, `npm ci`, `npx playwright install`, `npm run test:e2e`) matches the chosen config and secrets/env.
- [ ] Update this **Development commands** section to list `npm run test:e2e` once it exists.

## When changing this codebase

1. Follow **Tailwind** layout and styling patterns in `src/app/` and `src/components/`; use **Lucide** for icons and **Radix UI** primitives (styled with Tailwind) when you need accessible overlays or complex widgets.
2. Read the relevant `.agents/rules/*.md` before large edits.
3. Use `.agents/skills/incremental-implementation/SKILL.md` for multi-file work; keep the build and tests green between
   steps.
4. For architecture decisions that match **`docs/adr/README.md`**, **add or update an ADR** under **`docs/adr/`** using **`docs/adr/TEMPLATE.md`**, update **`docs/adr/README.md`** index, and do it in the **same change** as the code — see **`.agents/rules/architecture-adrs.md`**.
