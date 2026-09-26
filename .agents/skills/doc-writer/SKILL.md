---
name: doc-writer
description: >-
  Technical documentation writer skill for creating comprehensive READMEs, API specifications,
  Architecture Decision Records (ADRs), system sitemaps, and changelogs.
---

# Technical Documentation Writer Skill

Use this skill when drafting or updating project documentation, READMEs, API contracts, architectural decision records (ADRs), or user guides.

## Documentation Standards

### 1. Project README Structure
- **Header & Tagline**: Project name and concise value proposition.
- **Key Features**: Bulleted overview with badges/tables where relevant.
- **System Architecture**: High-level Mermaid diagram (`flowchart TB`).
- **Quickstart Guide**: Step-by-step installation & execution instructions.
- **Environment Variables**: Complete list of configurable environment variables.
- **API Reference / Endpoints**: HTTP methods, routes, request/response formats.
- **Troubleshooting**: Solutions for common setup or runtime issues.

### 2. Architectural Decision Records (ADR)
When significant design decisions are made, document them using standard ADR format:
- **Title**: `ADR-001: [Decision Title]`
- **Status**: Proposed / Accepted / Deprecated.
- **Context**: Problem statement and constraints.
- **Decision**: Chosen solution and rationale.
- **Consequences**: Trade-offs, benefits, and drawbacks.

### 3. API Contract Formatting
Document all API endpoints with exact JSON schemas, query parameters, status codes, and curl examples.
