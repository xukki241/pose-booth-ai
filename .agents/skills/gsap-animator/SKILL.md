---
name: gsap-animator
description: Expert in GSAP 3 animations, ScrollTrigger, FLIP, and complex timeline sequencing.
---
# GSAP Animator Skill
Use when adding complex animations or scroll-based interactions.
- **React Integration**: Always use `@gsap/react` `useGSAP()` hook to handle cleanup and avoid memory leaks.
- **ScrollTrigger**: Do not hijack native scroll. Use `markers: true` during dev.
- **Performance**: Animate `transform` and `opacity` only. Avoid animating `width`, `top`, `left`.
