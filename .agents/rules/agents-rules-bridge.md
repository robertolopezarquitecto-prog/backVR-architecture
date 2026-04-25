---
description: Load .agents/rules pattern docs before editing components, contexts, hooks, or tests
alwaysApply: true
---

# `.agents/rules` bridge

Canonical implementation patterns live under **`.agents/rules/`**. **Read the relevant file(s) with the Read tool before you edit** code in the matching area, so changes follow project conventions (do not rely on memory or assumptions).

**ADRs:** **`.agents/rules/architecture-adrs.md`** is **`alwaysApply: true`**. Before you finish work that changes stack, boundaries, or cross-cutting behavior, re-read it and **`docs/adr/README.md`** — if criteria match, you **must** add or update files under **`docs/adr/`** in the **same change** (see that rule file for the checklist).

| When you are changing…                                                                                                 | Read first                              |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| React UI (routes, feature components), composition, `src/app/**`, `src/components/**`                                  | `.agents/rules/components.md`           |
| React Context providers/consumers, global client state                                                                 | `.agents/rules/contexts.md`             |
| Custom hooks (`use*`), hook-heavy modules                                                                              | `.agents/rules/hooks.md`                |
| Tests, coverage, or user-facing behavior you are making testable                                                       | `.agents/rules/testing-requirements.md` |
| Stack, security, data/auth boundaries, major libraries, or cross-cutting conventions (often **write** `docs/adr/*.md`) | `.agents/rules/architecture-adrs.md`    |

If a task spans more than one row (for example a new hook used inside a new context), read **all** applicable rule files in the same pass before editing.

For procedure and personas (Testing Library, Playwright, functions), still follow **`AGENTS.md`** and **`.agents/subagents/`** as referenced there.
