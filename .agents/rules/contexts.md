---
description: Contexts — single responsibility, DRY, createContext + Provider + useX pattern
globs: src/contexts/**/*.ts, src/contexts/**/*.tsx
alwaysApply: false
---

# Contexts

- **Single responsibility:** One context per concern (e.g. auth session, workspace selection). Do not mix unrelated state in one provider.
- **DRY:** Before adding a context, consider whether **Next.js** URL or search params, **Tailwind** / CSS variables for theme, or a small module export is enough.
- **Pattern:** Prefer `createContext` + a Provider component + a custom `useX()` hook that calls `useContext` and throws if used outside the provider. Colocate under `src/contexts/` when you introduce app-wide client state.
- **Narrow value:** Expose only what consumers need; keep the context value small and memoize carefully when passing objects or callbacks.

**Theming:** Global styles and fonts live in `src/app/layout.tsx` and `globals.css` (Tailwind layers, CSS variables if you use them). Add a separate React context only for domain or session state, not to duplicate theme tokens that already belong in CSS or layout.

Follow patterns in existing files under `src/contexts/` for naming and error messages on missing provider.
