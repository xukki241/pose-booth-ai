---
name: test-driven-development
description: >-
  Enforces Test-Driven Development (TDD) principles: red-green-refactor cycle,
  writing tests before implementation, edge case coverage, and regression prevention.
---

# Test-Driven Development (TDD) Skill

Use this skill when implementing new features, fixing bugs, or refactoring existing modules.

## TDD Execution Cycle

### 1. RED Phase (Write Failing Test)
- Write the minimal test case defining expected input, output, and behavior.
- Run the test suite and confirm that the test fails for the expected reason.

### 2. GREEN Phase (Make Test Pass)
- Write the simplest code necessary to make the failing test pass.
- Do not add extra unrequested features or over-engineer at this stage.
- Run test suite to confirm green status.

### 3. REFACTOR Phase (Clean Up)
- Refactor implementation code and test code for clarity, performance, and DRY principles.
- Ensure all tests remain green throughout refactoring.
