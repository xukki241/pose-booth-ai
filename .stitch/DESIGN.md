# Pose-Booth AI — Design System (Dark Prism Glass)

## Section 1 — Core Identity
**Brand:** Pose-Booth AI — AI-powered photobooth with real-time pose detection  
**Project:** EXE101 Startup Project · FPT University 2026  
**Aesthetic:** Dark Glassmorphism + Prism Accents + 3D Depth  
**Feeling:** Premium tech studio — sophisticated, intelligent, immersive

## Section 2 — Color Palette
```
--bg-base:        #0A0A0F   /* near-black canvas */
--bg-surface:     #0F0F1A   /* card/panel base */
--glass-bg:       rgba(255,255,255,0.05)
--glass-bg-hover: rgba(255,255,255,0.09)
--glass-border:   rgba(255,255,255,0.08)
--glass-border-hover: rgba(168,85,247,0.3)

--prism-violet:   #A855F7
--prism-cyan:     #06B6D4
--prism-pink:     #F0ABFC
--prism-gradient: linear-gradient(135deg, #A855F7, #06B6D4, #F0ABFC)

--text-primary:   #F8FAFC
--text-secondary: #94A3B8
--text-muted:     #475569

--accent-emerald: #10B981   /* AI/data terminal feel */
--accent-amber:   #F59E0B   /* warning/score */
```

## Section 3 — Typography
```
--font-heading: 'Space Grotesk', sans-serif  /* modern tech feel */
--font-mono:    'Space Mono', monospace       /* code/data feel */
--font-body:    'Space Grotesk', sans-serif

Heading sizes: 72px / 48px / 36px / 24px / 18px
Body: 16px, line-height 1.6
Mono labels: 13px, letter-spacing 0.05em
```

## Section 4 — Glass Effect Recipe
```css
/* Standard glass card */
background: rgba(255,255,255,0.05);
backdrop-filter: blur(20px) saturate(180%);
-webkit-backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255,255,255,0.08);
border-radius: 16px;
box-shadow: 
  0 8px 32px rgba(0,0,0,0.4),
  inset 0 1px 0 rgba(255,255,255,0.1),
  0 0 0 1px rgba(168,85,247,0.05);

/* Hover state */
background: rgba(255,255,255,0.09);
border-color: rgba(168,85,247,0.3);
box-shadow: 
  0 8px 32px rgba(0,0,0,0.4),
  0 0 40px rgba(168,85,247,0.15);
```

## Section 5 — Signature Effects
```css
/* Prism text gradient */
.prism-text {
  background: linear-gradient(135deg, #A855F7, #06B6D4, #F0ABFC);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* Prism border glow */
.prism-border {
  border: 1px solid transparent;
  background: 
    linear-gradient(#0F0F1A, #0F0F1A) padding-box,
    linear-gradient(135deg, #A855F7, #06B6D4) border-box;
}

/* Film strip row */
.film-strip {
  display: flex;
  gap: 4px;
  background: #1a1a2e;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid rgba(168,85,247,0.2);
}

/* Noise texture overlay */
.noise::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,...");
  opacity: 0.03;
  pointer-events: none;
}
```

## Section 6 — Design System Notes for Stitch Generation (REQUIRED)

**COPY THIS BLOCK INTO ALL STITCH PROMPTS:**

```
Design System: Dark Glassmorphism Prism
Background: Deep dark #0A0A0F near-black
Cards: Frosted glass effect — semi-transparent with white at 5% opacity, blur backdrop, subtle white top border highlight
Accent colors: Violet #A855F7 (primary), Cyan #06B6D4 (secondary), Pink #F0ABFC (highlight)  
Text: White #F8FAFC primary, Slate #94A3B8 secondary
Typography: Space Grotesk for all text — modern tech sans-serif
Headings: Large, bold, with prism gradient (violet-to-cyan) on key words
Borders: Very subtle — rgba white 8% opacity, or prism gradient borders on featured elements
Shadows: Deep dark shadows, no harsh drop shadows — use glow for hierarchy
Icons: Minimal line icons, white or prism-colored
Buttons: Primary = solid violet #A855F7 with glow; Secondary = glass card style
Overall feel: Premium AI studio, sophisticated, dark but NOT flat — has depth via glass layers
NO light backgrounds, NO warm colors, NO coral/orange — purely dark + prism cool tones
```

## Section 7 — Component Patterns
- **Navigation:** Horizontal pill nav, glass bg, prism active indicator underline
- **Hero section:** Full viewport, centered, large prism headline, dual CTA buttons, animated background
- **Cards:** Glass cards in grid, subtle prism border on hover, 3D tilt effect on interaction
- **Forms/Inputs:** Dark input fields with glass bg, prism focus ring
- **Badges/Tags:** Rounded pills, glass bg, prism text
- **Dividers:** Single pixel rgba(255,255,255,0.06) lines
