---
name: agile-project-manager
description: >-
  Project management skill for Agile/Scrum workflows, sprint planning, roadmap creation,
  task breakdown, feature estimation, and backlog grooming.
---

# Agile Project Manager Skill

Use this skill when planning project milestones, breaking features into user stories, grooming backlogs, estimating effort, or creating project roadmaps.

## Workflow & Guidelines

### 1. Feature Decomposition
Break large epic requirements down into granular user stories following standard INVEST criteria:
- **Independent**: Deliverable without hard blockages where possible.
- **Negotiable**: Flexible on details.
- **Valuable**: Clear user or system value.
- **Estimable**: Sized appropriately.
- **Small**: Completeable in a single iteration.
- **Testable**: Explicit acceptance criteria included.

### 2. Task Breakdown Template
For each task/story, structure as:
```markdown
### [Task ID] Task Title
- **Goal**: Clear objective statement.
- **Scope**: What is included and excluded.
- **Dependencies**: Prerequisites or blocking items.
- **Acceptance Criteria**:
  - [ ] Criterion 1
  - [ ] Criterion 2
- **Technical Tasks**:
  1. Step 1...
  2. Step 2...
```

### 3. Sprint & Milestone Planning
- Organize tasks into Logical Milestones (M1: MVP, M2: Feature Polish, M3: Release).
- Maintain dependency graphs using Mermaid flowcharts (`flowchart TD`).
- Flag high-risk blockers early.
