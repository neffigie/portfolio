# Design System: Editorial Ether

## Creative North Star
The site is a **digital curator** — a high-end, sun-drenched gallery in the early morning. Quiet, intentional, profoundly spacious. Literary and editorial, not app-like or product-marketing. Every element should feel placed, not generated.

## Atmosphere
The site must feel: luminous, airy, serene, refined, editorial, gallery-like, slightly dreamy but legible.

Do not drift into: dark / brooding aesthetics, black-heavy layouts, sci-fi / cyberpunk, generic SaaS sections, dashboard density, template-looking centered symmetry, loud effects.

## Colors & Surfaces

### Color Tokens
- `brand.500` (primary action): `#2a6c5c` — vivid teal, clearly distinguishable from grey
- `brand.600` (hover): `#1f5346`
- `ink.primary`: `#111c1b` — near-black with teal undertone, strong contrast on light surfaces
- `ink.muted`: `#4a6560` — readable secondary text, not washed out
- `ink.faint`: `#7a9490` — tertiary / placeholders only

### Surface Hierarchy
- `surface.bright`: `#f9f9f8`
- `surface.containerLow`: `#eff3f2`
- `surface.containerLowest`: `#ffffff`
- `surface.containerHighest`: `#cdd8d6` — distinct enough for borders and dividers

Palette operates in the 80–90% brightness range. Use dark colors only for legibility and anchoring. Brand color must be visibly teal, not grey.

### No-Line Rule
1px solid borders are prohibited for sectioning. Define boundaries through tonal shifts instead.

### Gradient Rule
Main CTAs or hero backgrounds: subtle `linear-gradient(135deg, #4f625d, #d1e7e0)`.

## Typography

- **Display / headlines:** `Newsreader` — editorial, expressive, felt
- **Body / UI / labels:** `Manrope` — interface, metadata, small copy

Rules:
- High-contrast scale shifts: large display headline paired with tiny metadata
- Headline tracking: ~`-0.02em`
- Uppercase microcopy tracking: ~`+0.05em`
- Typography tone: literary, composed, quiet, confident — not gothic, harsh, or aggressively fashion-editorial

## Elevation & Depth

Depth comes from tonal layering, not aggressive shadows.

- A lighter surface on a slightly darker tonal surface creates lift.
- Ambient shadow for floating elements: `box-shadow: 0 20px 40px rgba(44, 52, 51, 0.04)`
- Ghost border (accessibility fallback only): `outline-variant` neutral at ~15% opacity, barely perceptible

Use subtle mesh or atmospheric gradients in larger sections to mimic morning mist.

## Glassmorphism

Use sparingly and intentionally. Glass is a signature accent, not a pattern.

**Must-have glass components:** top navbar, scroll-to-top button, tag chips/filters, select UI accents, occasional floating panels.

**Do not** apply glass to cards.

**Glass properties to use:**
- translucent surface (e.g., `whiteAlpha.600`)
- soft `backdrop-filter: saturate(180%) blur(16px)`
- subtle highlight edges
- light neutral tinting
- refined ambient shadow

**Avoid:** exaggerated blur, jelly-like UI, overuse of frosted surfaces, shiny effects that overpower content.

### Navbar
A thin floating acrylic layer. Readable over content. Restrained blur and tonal separation. Clean, quiet presence. Adapts over light backgrounds and imagery.

### Scroll-to-Top
Appears after meaningful scroll depth. Glassy treatment. Elegant show/hide transition. Smooth scroll on activation. Visually small but refined and clearly intentional.

## Layout

### Intentional Asymmetry
Do not center everything by default. Use offset composition: larger left margins in hero sections, text offset from image blocks, cards slightly overlapping sections, negative space as a design tool.

### Whitespace
If the layout feels comfortable, it needs more room. Bias toward more breathing room.

### Sectioning
Prefer tonal changes and spacing over borders or separators. No horizontal rules between sections.

### Grid
A grid may exist under the hood, but the result must not feel rigid or templated.

## Border Radius

Consistently rounded — not sharp, not pill-shaped:
- **Cards / panels / post content box:** `borderRadius="xl"` (12px)
- **Buttons (primary/outlined CTAs):** `borderRadius="lg"` (8px)
- **Icon buttons:** `borderRadius="md"` (6px)
- **Tag pills / chips:** `borderRadius="full"` (pill)
- **Alerts / inline notices:** `borderRadius="md"` (6px)

Never use `borderRadius={0}` for cards or buttons. Sharp edges have been explicitly replaced with this rounded system.

## Component Language

**Buttons**
- Primary: `primary` background, `on-primary` text, `borderRadius="lg"`
- Outlined CTA: `1px solid ink.primary`, fills `ink.primary` on hover, `borderRadius="lg"`
- Secondary: elevated tonal surface, no obvious border
- Tertiary: text-only, underline on hover

**Cards**
- No divider lines
- Glass gradient panel: `linear-gradient(135deg, rgba(255,255,255,0.78), rgba(241,244,243,0.52))`
- `backdropFilter="blur(12px)"`, `border="1px solid" borderColor="surface.containerHighest"`
- `borderRadius="xl"`
- Spacing separates content; tonal surface separation over framing

**Chips / Tags**
- Luminous and subtle, like sea glass

**Lists**
- No horizontal rules; alternate rows with surface shifts if needed

**Inputs**
- Ghost-style; low-contrast filled surface; subtle bottom border; stronger `primary` focus state

## Do / Don't

Do:
- Use extreme whitespace
- Use asymmetrical margins where they improve editorial feel
- Use `Newsreader` for emotionally resonant text
- Layer surfaces tonally to create depth

Don't:
- Use pure black (`#000000`)
- Use heavy Material-like shadows
- Use 100% opaque borders for sectioning
- Center-align everything
- Scatter design tokens; centralize them
- Overuse frosted surfaces indiscriminately
- Use `borderRadius={0}` on cards or buttons

## Review Heuristics
Before finishing any visual change, ask:
- Does this feel curated or templated?
- Is there enough whitespace?
- Is the hierarchy clear?
- Is the glass effect tasteful and restrained?
- Does this preserve readability?
- Does this match Editorial Ether?
- Did we centralize the design logic, or scatter it?
