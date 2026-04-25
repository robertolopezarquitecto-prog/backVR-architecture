---
description: Require thorough automated tests for new or changed behavior
alwaysApply: true
---

# Testing requirements

Treat sparse coverage as a gap to close, not a reason to skip tests. **New or materially changed behavior must ship with automated tests** appropriate to the layer you touched.

## What to add

| Area                          | Prefer                                                                                                                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App (`src/`), shared packages | **Vitest** unit/component tests; **Testing Library** for React (user-centric queries, `user-event`, `findBy*` / `waitFor` for async UI—see `.agents/subagents/testing-agent.md`) |
| Critical user journeys        | **Playwright** (`.agents/subagents/playwright-ui.md`)                                                                                                                            |

Cover happy path, meaningful errors/edge cases, and async behavior where relevant. Avoid coupling tests to implementation details when a user-facing assertion is enough.

## Workflow

1. Read **`.agents/subagents/testing-agent.md`** before adding or restructuring tests; use **`.agents/subagents/unit-tester.md`** for focused unit work.
2. Run **`npm run test`** for the app/packages you changed; **`npm run test:e2e`** when you add or change Playwright coverage.
3. Do not finish while tests are red; fix the code or the test, then re-run.
4. If you introduce a new test runner or suite, wire it into **`package.json`** and **`.github/workflows/`** (`tests.yml`, `e2e.yml`) so CI stays honest.

## When tests are optional

Trivial-only changes (typo in copy, comment-only, pure formatting) may skip new tests. Anything that changes runtime behavior, contracts, or user-visible output should be tested.
