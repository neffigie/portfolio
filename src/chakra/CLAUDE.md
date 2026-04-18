# Chakra Theme

All design tokens live here. This directory is the source of truth for the visual system.

## Current State vs. Target

| Token | Current | Target (Editorial Ether) |
|---|---|---|
| Heading font | Inter | Newsreader |
| Body font | Inter | Manrope |
| Brand color | Blue (`#0d69e5`) | Teal/sage (`#4f625d`) |
| Surfaces | Not yet tokenized | See `.claude/rules/design-system.md` |

Do not assume the current theme matches the Editorial Ether spec. When implementing the overhaul, replace current values with the Editorial Ether palette.

## Directory Structure

```
src/chakra/theme/
  index.ts              ← assembles theme via extendTheme(); register new tokens here
  colors.ts             ← color tokens (brand palette, surface hierarchy)
  styles.ts             ← global body styles
  foundations/
    fonts.ts            ← heading/body font assignments + CSS variable name
  components/
    link.ts             ← Chakra Link component override
    blockquote.ts       ← Prose blockquote override
```

## How to Extend

**Add a color or surface token:** Edit `colors.ts`, then reference via `theme.colors.*` in components.

**Add a foundation token (spacing, radii, etc.):** Create a file in `foundations/`, export a value, import and spread it into the `theme` object in `index.ts`.

**Add a component override:** Create a file in `components/`, export a Chakra component style config, register it in `index.ts` under `theme.components`.

**withDefaultColorScheme** applies the `brand` color scheme to `Tag`, `Badge`, `Spinner`, `Code` by default. Changing the brand color will affect all of these.

**withProse** from `@nikolovlazar/chakra-ui-prose` controls rich-text rendering. Prose overrides (e.g., blockquote) go in `components/blockquote.ts`.

## Token Naming

Use semantic names, not visual names.

Good: `surfaceBright`, `surfaceContainerLow`, `glassPanel`, `textPrimary`, `borderGhost`
Avoid: `lightGray2`, `boxBg`, `buttonTint`

Avoid one-off magic numbers in component props (e.g., `backdropFilter="blur(16px)"`). Prefer CSS variables or Chakra token references so changes propagate.

## Fonts

The font CSS variable is exported as `FontClassName` from `foundations/fonts.ts`. When switching to Newsreader/Manrope, update both the Next.js font imports in `src/app/layout.tsx` and the `fonts.ts` foundations file.
