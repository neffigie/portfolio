# neffigie.com

Personal portfolio for a multidisciplinary creator: software engineer, game developer, artistically driven builder.

**Active initiative:** Visual 2.0 overhaul — new design language replacing Editorial Ether. See design-system.md.

## Core Goal

Preserve functionality and information architecture. Overhaul the visual system, component language, typography, spacing, motion, and glassmorphism.

Do not rewrite working functionality. Do not add features. Do not change routes or page purposes.

## Stack

- Next.js 13.5, App Router (`src/app/`)
- Chakra UI v2 + Emotion — theme lives in `src/theme/`
- Framer Motion v10
- React Three Fiber (`@react-three/fiber`, `@react-three/drei`) — hero scene
- `html2canvas` — page capture for glassmorphic displacement (GlassPanel bar profile)
- PocketBase (CMS backend)
- TypeScript, **npm**

## Commands

```
npm run dev      # dev server
npm run build    # production build
npm run lint     # ESLint
tsc --noEmit     # typecheck (no npm script for this)
```

## Rules

Design direction and visual constraints: `.claude/rules/design-system.md`
Working mode and response formats: `.claude/rules/workflow.md`

## Uncertainty

When uncertainty affects architecture, UX, or design direction: state it, propose the most likely interpretation, ask if it changes the outcome.

## Memory

Update this file and the rules files when project conventions change.
