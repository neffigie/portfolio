# Workflow

## Plan Before Editing

For non-trivial tasks, always inspect and plan before making changes:
1. Identify relevant files
2. Summarize current implementation
3. Produce a step-by-step plan
4. Call out assumptions or ambiguities
5. Then implement

Do not skip planning for medium or large tasks unless the user explicitly asks.

## Pre-Implementation Response Format

- **Goal**
- **Current state**
- **Plan**
- **Files likely to change**
- **Risks / assumptions**

## Post-Implementation Response Format

- **What changed**
- **Files changed**
- **Design/system decisions**
- **How it was verified**
- **Follow-up issues or recommendations**

## UI Task Order

When working on UI or layout changes, think in this order:
1. design intent
2. information hierarchy
3. reusable tokens
4. layout rhythm
5. component structure
6. interaction states
7. responsiveness
8. accessibility
9. polish

Do not start by throwing styles at the page.

## Visual Overhaul Task Sequence

When working on the Editorial Ether overhaul, follow this sequence unless told otherwise:
1. Inspect current implementation
2. Identify reusable primitives that should exist
3. Define or refine design tokens in `src/chakra/theme/`
4. Implement typography and surface system
5. Implement navbar
6. Implement core layout scaffolding
7. Implement shared buttons / chips / panels
8. Implement scroll-to-top control
9. Update remaining pages to the system
10. Verify consistency and responsiveness

## Accessibility Constraints

The site is artistic but must remain usable. Always preserve:
- Readable contrast ratios
- Semantic HTML
- Keyboard accessibility
- Visible focus states
- Touch target usability
- Responsive layout integrity
- Content discoverability

If a design choice conflicts with accessibility, preserve the spirit of the design while keeping the interface usable.

## Output Quality Bar

A good result:
- Preserves the site's core job
- Feels like a genuine 2.0 redesign
- Reads as a coherent system, not isolated pretty fragments
- Is maintainable and accessible
- Is consistent across pages
- Uses glassmorphism as a signature accent, not a gimmick
- Makes the navbar and scroll-to-top feel intentionally designed
