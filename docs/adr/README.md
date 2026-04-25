# Architectural Decision Records (ADRs)

This directory holds **ADRs**: short, durable notes that capture a significant architecture decision, its context, and its consequences. They help humans and agents understand _why_ the system looks the way it does.

## When to add an ADR

Add one when a decision is **hard to reverse**, **affects multiple parts of the codebase**, or **sets a precedent** others should follow. Examples:

- Choosing or replacing a framework, major library, or deployment pattern
- Defining boundaries (API shapes, auth model, data ownership, caching strategy)
- Cross-cutting conventions that differ from what is already documented in `AGENTS.md`

Skip an ADR for small, local refactors or obvious bug fixes.

## File naming and numbering

- Use **one markdown file per decision**.
- Name files: **`NNNN-short-title-in-kebab-case.md`** where `NNNN` is a **four-digit** sequence (e.g. `0002`, `0012`).
- Pick the next number after the highest existing file in this directory (template files like `TEMPLATE.md` are not numbered ADRs).
- Titles should be **stable** (describe the decision, not the meeting date).

## How to write a new ADR (humans)

1. Copy [`TEMPLATE.md`](./TEMPLATE.md) to `NNNN-your-title.md`.
2. Fill every section; remove optional blocks you do not need.
3. Start with **Status:** `Proposed` until the team agrees, then set **`Accepted`** (or `Deprecated` / `Superseded by ADR-XXXX` when replaced).
4. Open a PR that includes only the new ADR (or the ADR plus the code that implements it), and request review from someone who owns that area.

## How agents should use this

When implementing a decision that matches **When to add an ADR** above, **add a new ADR file in the same PR as the implementation** (not afterward). Use [`TEMPLATE.md`](./TEMPLATE.md), the next sequence number, a clear kebab-case title, and **update the index table below**. Follow **`.agents/rules/architecture-adrs.md`** for the full checklist. Link related PRs or issues in **Notes** if helpful.

## Index

| ADR                                             | Title                         | Status   |
| ----------------------------------------------- | ----------------------------- | -------- |
| [0001](./0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |

Update this table when you add ADRs.
