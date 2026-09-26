---
name: spec-driven-development
description: >-
  Harness for Specification-Driven Development (SDD): converting feature ideas into
  structured specs, step-by-step implementation plans, and verification gates.
---

# Spec-Driven Development (SDD) Skill

Use this skill when designing complex features, establishing clear technical specifications before coding, or executing multi-step architectural changes.

## SDD Lifecycle

### Phase 1: Requirements & Spec Drafting
Write a formal specification (`SPEC.md` or design artifact) including:
1. **Context & Goals**: Why this feature is needed and problem statement.
2. **Architecture & Interfaces**: Data flows, API signatures, schema definitions.
3. **Edge Cases & Failure Modes**: Error states, rate limits, offline handling.

### Phase 2: Implementation Plan
Create a step-by-step checklist where each task is:
- Atomic and verifiable.
- Sequenced by dependency order.
- Annotated with expected verification commands (e.g., `npm test`, `pytest`, `cargo test`).

### Phase 3: Incremental Execution & Verification
- Execute one task at a time.
- Verify empirical success after every step.
- Update checklist status immediately upon completion.
