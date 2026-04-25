---
description: Architecture — document significant decisions as ADRs under docs/adr
alwaysApply: true
---

# Architecture decisions (ADRs)

- **Location:** All ADRs live under **`docs/adr/`**. Do not place ADRs elsewhere.
- **When:** Add a new ADR when the change is **significant, cross-cutting, or hard to reverse** (stack choices, security or data boundaries, major API or caching patterns, replacing a core library). Skip for small refactors or obvious fixes.
- **Format:** Copy the structure from **`docs/adr/TEMPLATE.md`**. Filename: **`NNNN-kebab-case-title.md`** with the next four-digit index after existing numbered ADRs.
- **Lifecycle:** Use **Status** `Proposed` until review; set **`Accepted`** when merged. If a later decision replaces this one, mark the old ADR **Deprecated** or **Superseded by ADR-XXXX** and add a new ADR for the replacement.
- **Index:** Add a row to the table in **`docs/adr/README.md`** when you add an ADR.

If unsure whether an ADR is warranted, prefer writing a short ADR over leaving the rationale only in chat or a PR description.
