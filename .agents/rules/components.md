---
description: Components & pages — Tailwind, Radix UI, Lucide, DRY, reuse primitives, composition
globs: src/components/**/*.tsx, src/app/**/*.tsx
alwaysApply: false
---

# Components & pages

- **Layout & styling:** Use **Tailwind CSS** (already in the project) for layout, spacing, typography, and responsive behavior (`sm:`, `md:`, etc.). Prefer semantic HTML and utility composition over one-off arbitrary values when the scale covers the need.
- **Radix UI (optional):** For accessible primitives (dialog, dropdown, tabs, checkbox, etc.), prefer **[Radix UI](https://www.radix-ui.com/primitives)** when you need behavior and a11y beyond plain elements. Radix is unstyled—pair each part with **Tailwind** `className`s so it stays consistent with the rest of the app. Add only the `@radix-ui/react-*` packages you use.
- **Icons:** Use [`lucide-react`](https://lucide.dev/icons/) (named imports). Compose with buttons and labels using Tailwind for size and color.
- **Routes:** App Router screens live under `src/app/` as `page.tsx`, `layout.tsx`, `loading.tsx`, `not-found.tsx`, etc. Prefer small route modules that compose shared UI; extract reusable blocks into `src/components/<feature>/` when the same UI appears in more than one place.
- **DRY:** Reuse your own components under `src/components/` instead of duplicating large JSX across pages.
- **SOLID:** One clear responsibility per component; prefer composition over huge prop lists.
- **Path alias:** Use `@/` for imports from `src/` (e.g. `@/components/...`).

Under `src/components/`, use **kebab-case** filenames, colocate `*.test.tsx` next to non-trivial components, and match import style from sibling `src/app/` routes and components.
