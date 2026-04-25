---
description: Hooks — DRY, single responsibility, TanStack Query for server state
globs: src/hooks/**/*.ts, src/hooks/**/*.tsx, **/use-*.ts, **/use-*.tsx
alwaysApply: false
---

# Hooks

- **DRY:** Extract reusable logic into hooks. Before adding a hook, check whether existing modules under `src/hooks/` already cover the use case.
- **Single responsibility:** One hook, one concern (e.g. `use-window-size`, `use-debounce`).
- **Naming:** Use the `use` prefix and kebab-case filenames (`use-feature-flag.ts`).
- **Server state:** Use **[TanStack Query](https://tanstack.com/query/latest)** (`useQuery`, `useMutation`, `useQueryClient`, etc.) for remote data: caching, background refresh, deduping, and mutation lifecycle. Keep fetch/query functions in small modules next to the feature (e.g. under `src/lib/<area>/` or beside the hook that uses them); use **`@/query-client`** (`createQueryClient`) and **`AppQueryProvider`** from `src/app/providers.tsx` (imported in `src/app/layout.tsx`) as the integration point—do not introduce a parallel client-state layer for the same data.
- **Return shape:** Return a small object or a stable tuple; document non-obvious contracts in a line or two above the export.

**Theming:** Theme and layout behavior come from **Tailwind** and global CSS (`globals.css`, `layout.tsx`). Prefer `prefers-color-scheme` or a class-based dark mode on `<html>` / `<body>` if you add themes. Do not duplicate global theme state in a custom hook unless there is a product-specific reason.

Reference existing files in `src/hooks/` for naming and patterns before adding new hooks.
