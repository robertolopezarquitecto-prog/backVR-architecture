---
description: Components & pages — Reshaped, Lucide, DRY, reuse primitives, composition
globs: src/components/**/*.tsx, src/pages/**/*.tsx
alwaysApply: false
---

# Components & pages

- **Reshaped:** Build UI with [Reshaped](https://reshaped.so) (`View`, `Text`, `Button`, `TextField`, `Modal`, `Tabs`, etc.). Use the [React getting started](https://reshaped.so/docs/getting-started/react/installation) and per-component docs for props, responsive values, and accessibility.
- **Icons:** Use [`lucide-react`](https://lucide.dev/icons/) (named imports). Pass icon components to Reshaped where supported (e.g. `Button` `icon`, `Icon` `svg`).
- **Pages:** Route screens live under `src/pages/` (see `home-screen.tsx`, `not-found.tsx`). Prefer small page modules that compose Reshaped primitives; extract reusable blocks into `src/components/<feature>/` when the same UI appears in more than one place.
- **DRY:** Reuse your own components under `src/components/` instead of duplicating large JSX across pages.
- **SOLID:** One clear responsibility per component; prefer composition over huge prop lists.
- **Path alias:** Use `@/` for imports from `src/` (e.g. `@/pages/home-screen`).

Under `src/components/`, use **kebab-case** filenames, colocate `*.test.tsx` next to non-trivial components, and match import style from `src/pages/`.
