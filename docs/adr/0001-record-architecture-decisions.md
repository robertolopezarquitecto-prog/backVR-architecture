# ADR-0001: Record architecture decisions

## Status

Accepted

## Date

2026-04-25

## Context

The project needs a single, predictable place to capture **why** important technical choices were made, so future contributors (human or automated) do not re-litigate settled questions or lose rationale when code alone is insufficient.

## Decision

We will use **Architectural Decision Records (ADRs)** stored under **`docs/adr/`**, following the shared [`TEMPLATE.md`](./TEMPLATE.md) and the workflow described in [`README.md`](./README.md).

## Consequences

### Positive

- Decisions have a durable, searchable history next to the repository.
- New work can align with documented intent instead of inferring from implementation alone.

### Negative / trade-offs

- Authors must spend a few minutes writing context when a decision qualifies for an ADR.
- ADRs can go stale if not updated when a decision is superseded; status and follow-up ADRs should reflect that.

### Risks and mitigations

- **Risk:** ADR sprawl for trivial changes. **Mitigation:** Only add ADRs for decisions that are significant, cross-cutting, or hard to reverse (see `README.md`).

## Alternatives considered

| Option                    | Why not chosen                                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| Wiki or external doc only | Loses version history with the code change that implements the decision; harder to review in the same PR. |
| Comments only in code     | Hard to discover across modules; weak for system-level trade-offs.                                        |

## Notes

- Process details: [`README.md`](./README.md).
