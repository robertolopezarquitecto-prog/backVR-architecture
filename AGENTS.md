# Repository guide

This document describes how the project is structured and how to extend it safely. It is written for **humans and
automated coding agents** (for example Antigravity, Cursor, Claude Code, GitHub Copilot, and similar tools).

## Agent rules and skills

**`@` path composition:** Some coding agents merge lines that start with `@` into project instructions when this
document is loaded. The lines below are the canonical includes for this repo’s rules and skills. If your agent does not
expand `@` inside an already-imported file, repeat the same `@` lines in whatever root instruction file
loads `AGENTS.md`.

@.agents/rules/components.md
@.agents/rules/contexts.md
@.agents/rules/hooks.md
@.agents/rules/testing-requirements.md
@.agents/rules/architecture-adrs.md
@.agents/skills/using-agent-skills/SKILL.md
@.agents/skills/frontend-ui-engineering/SKILL.md
@.agents/skills/incremental-implementation/SKILL.md
@.agents/skills/security-and-hardening/SKILL.md

**All coding agents:** Honor the paths above. Before editing, **read** the `.agents/rules/*.md` file(s) that match the
area you are changing (components, contexts, hooks, tests). **Architecture:** follow `.agents/rules/architecture-adrs.md`
for significant, cross-cutting, or hard-to-reverse decisions (ADRs in `docs/adr/`). For skills, open a given `.agents/skills/*/SKILL.md` when
its YAML `description` fits the task—start with `using-agent-skills`. A **change area → rule file** table for editors
that support workspace rules lives at `.cursor/rules/agents-rules-bridge.mdc`; elsewhere, follow the same mapping using
those rule filenames even when that bridge file is not loaded for you.

## Project overview

TBD

## Key principles

### UI

TBD

### Server state

TBD

### File naming

TBD, e.g. for react use **kebab-case** for source files: `home-screen.tsx`, `use-auth.ts`, `settings-form.test.tsx`.

## Project structure

TBD

## Styling and theming

TBD

## Development commands

```bash
npm run dev          # Vite dev server (http://localhost:5174)
npm run build        # TypeScript project references + Vite production build
npm run test         # Vitest
npm run lint         # ESLint
npm run format       # Prettier (write)
npm run format:check # Prettier (check)
npm run test:e2e     # Playwright
```

## Tests

Follow **`.agents/rules/testing-requirements.md`**. New or changed behavior should include appropriate automated tests.

## When changing this codebase

1. Follow Reshaped + Lucide patterns already used in `src/pages/`.
2. Read the relevant `.agents/rules/*.md` before large edits.
3. Use `.agents/skills/incremental-implementation/SKILL.md` for multi-file work; keep the build and tests green between
   steps.
4. For architecture decisions that match the criteria in `docs/adr/README.md`, add or update an ADR under `docs/adr/`
   using `docs/adr/TEMPLATE.md`.
