# Pose-Booth UI Design Contract

## Design authority

The global theme is adapted from `yunkhngn/prismo-photo` (MIT). Prismo is the authority for typography and semantic color tokens only. Pose-Booth remains the authority for routes, information architecture, camera workflow, pose scoring, frame selection, and export behavior.

## Locked decisions

- UI copy uses Nunito; technical metadata and numeric telemetry use Geist Mono.
- The theme preference is `system`, `light`, or `dark`. `system` is the first-run default; an explicit user selection persists locally.
- Light and dark modes use semantic Tailwind/shadcn roles: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, chart, and sidebar tokens.
- Existing route layout and responsive breakpoints are preserved.
- Camera viewfinders may remain optically black because they are media surfaces, not page chrome.

## Interaction and accessibility

- Theme is applied before hydration to avoid a wrong-theme flash.
- System preference changes update the UI while the stored preference is `system`.
- Keyboard focus uses the semantic ring token and remains visible in both themes.
- Motion is reduced when `prefers-reduced-motion: reduce` is active.
- Text and controls must use semantic foreground/background pairs instead of assuming a dark canvas.

## Explicit non-goals

- Do not port Prismo's camera flow, frames, copy, or layout.
- Do not restore the old dark-prism/neon visual language as the global theme.
- Do not add decorative AI-generated gradients, glow, or new page structures.
- Do not create a second frontend from the legacy root Vite application.

## Acceptance checks

- `/`, `/booth`, `/pose-studio`, `/frames`, and `/about` render in light, dark, and system modes.
- Theme selection persists across reloads, without hydration warnings.
- Camera permission/error, pose overlay, score, countdown, capture, and export states remain legible.
- Desktop and mobile layouts do not introduce horizontal overflow.
