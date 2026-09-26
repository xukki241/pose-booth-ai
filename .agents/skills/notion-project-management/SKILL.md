---
name: notion-project-management
description: >-
  Notion integration for project management, task tracking, database querying,
  PRD creation, sprint backlogs, and page sync using Notion MCP tools.
---

# Notion Project Management Skill

Use this skill when managing project tasks, updating Notion databases, writing Product Requirement Documents (PRDs), or syncing sprint backlogs via Notion MCP tools.

## Key Capabilities

1. **Database & Task Querying**: Use `API-post-search` or `API-query-data-source` to find tasks, user stories, or project pages in Notion.
2. **Page & Task Creation**: Use `API-post-page` to create new tasks, bug reports, feature specs, or meeting notes inside designated Notion databases.
3. **Task Status Updates**: Use `API-patch-page` to update task progress (e.g., 'Not Started' -> 'In Progress' -> 'Done').
4. **Documentation & Spec Sync**: Create structured PRDs and technical architecture documents using `API-update-page-markdown`.

## Execution Protocol

### Step 1: Discover & Map Notion Structure
- Query Notion workspace using `API-post-search` to locate target databases (e.g., "Tasks", "Sprint Backlog", "Roadmap", "PRDs").
- Inspect database property schemas (`API-retrieve-a-database`) to determine exact status select options and property fields.

### Step 2: Task Breakdown & Creation
- Convert high-level user requests into actionable sub-tasks.
- Format task pages with clear properties:
  - **Title**: Concise action-oriented title.
  - **Status**: Selected from valid database status options.
  - **Priority**: High / Medium / Low.
  - **Content**: Background context, acceptance criteria, and checklists.

### Step 3: Notion Sync & Verification
- Verify successful updates after running `API-patch-page` or `API-post-page`.
- Report updated page URLs or IDs back to the user.
