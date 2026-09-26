---
name: git-workflow-manager
description: >-
  Automates and standardizes Git workflows, conventional commit messages,
  branch naming conventions, PR descriptions, and release notes.
---

# Git Workflow Manager Skill

Use this skill when managing git commits, branch strategies, pull request descriptions, or release changelogs.

## Conventional Commits Protocol

Use standard conventional commit prefixes:
- `feat:` A new user-facing feature.
- `fix:` A bug fix.
- `docs:` Documentation only changes.
- `style:` Formatting, missing semi-colons, no code change.
- `refactor:` Code change that neither fixes a bug nor adds a feature.
- `perf:` Performance improvements.
- `test:` Adding or correcting existing tests.
- `chore:` Maintenance tasks, dependency updates, build tools.

## Pull Request Template
```markdown
## Summary of Changes
- Concise summary line 1
- Concise summary line 2

## Issue / Task Link
Fixes #[Issue Number]

## Verification & Testing
- [x] Unit tests passed
- [x] Manual UI verification completed
```
