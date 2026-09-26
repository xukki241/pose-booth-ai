---
name: frontend-nextjs-expert
description: Next.js 14/15/16 App Router expert. Handles Server Components, Server Actions, SSR, hydration, and routing.
---
# Next.js Expert Skill
Use when building or debugging Next.js App Router applications.
- **RSC First**: Default to React Server Components. Only add `"use client"` when interactivity/hooks are strictly required.
- **Data Fetching**: Use native `fetch` with caching/revalidation tags over useEffect.
- **Server Actions**: Keep mutations secure. Validate inputs with Zod before processing.
- **Hydration**: Avoid mismatched HTML between server and client (e.g., careful with `window` checks on initial render).
