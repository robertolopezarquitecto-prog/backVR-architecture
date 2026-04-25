---
description: Hooks — DRY, single responsibility, TanStack Query for server state
globs: src/hooks/**/*.ts, src/hooks/**/*.tsx, **/use-*.ts, **/use-*.tsx
alwaysApply: false
---

# Hooks

- **DRY:** Extract reusable logic into hooks. Before adding a hook, check whether existing modules under `src/hooks/` already cover the use case.
- **Single responsibility:** One hook, one concern (e.g. `use-window-size`, `use-debounce`).
- **Naming:** Use the `use` prefix and kebab-case filenames (`use-feature-flag.ts`).
- **Server state:** Use **[TanStack Query](https://tanstack.com/query/latest)** (`useQuery`, `useMutation`, `useQueryClient`, etc.) for remote data: caching, background refresh, deduping, and mutation lifecycle. Keep fetch/query functions in small modules (e.g. `src/api/` or next to features); use **`@/query-client`** (`createQueryClient`) and **`AppQueryProvider`** in `src/main.tsx` as the integration point—do not introduce a parallel client-state layer for the same data.
- **Return shape:** Return a small object or a stable tuple; document non-obvious contracts in a line or two above the export.

**Reshaped:** Theme and viewport behavior often come from the root `<Reshaped>` provider and Reshaped hooks (e.g. `useTheme` from `reshaped` when needed). Do not duplicate global theme state in a custom hook unless there is a product-specific reason.

Reference existing files in `src/hooks/` for naming and patterns before adding new hooks.
