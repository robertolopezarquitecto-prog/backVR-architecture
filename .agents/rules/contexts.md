---
description: Contexts — single responsibility, DRY, createContext + Provider + useX pattern
globs: src/contexts/**/*.ts, src/contexts/**/*.tsx
alwaysApply: false
---

# Contexts

- **Single responsibility:** One context per concern (e.g. auth session, workspace selection). Do not mix unrelated state in one provider.
- **DRY:** Before adding a context, consider whether **React Router** URL state, **Reshaped** theming, or a small module export is enough.
- **Pattern:** Prefer `createContext` + a Provider component + a custom `useX()` hook that calls `useContext` and throws if used outside the provider. Colocate under `src/contexts/` when you introduce app-wide client state.
- **Narrow value:** Expose only what consumers need; keep the context value small and memoize carefully when passing objects or callbacks.

**Reshaped:** The root `<Reshaped>` provider in `src/main.tsx` already owns design theme and color mode for UI built with Reshaped components. Add a separate React context only for domain or session state, not to duplicate Reshaped’s theme APIs.

Follow patterns in existing files under `src/contexts/` for naming and error messages on missing provider.
