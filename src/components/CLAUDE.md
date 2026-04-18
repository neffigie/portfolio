# Components

## Organization

Each component lives in its own folder with an `index.tsx` and named exports. Barrel exports are maintained in `src/components/index.tsx` — update it when adding a component.

## Naming

`PascalCase`, semantic. Examples: `GlassNavbar`, `ScrollToTopButton`, `EditorialHero`, `ProjectCard`.

## Glassmorphism

Components that **must** have glass treatment:
- `header/` — the navbar (already implemented with `whiteAlpha.600` + `backdropFilter`)
- Any scroll-to-top control (not yet built)

Glass-eligible (apply when appropriate):
- `tags/TagSelect.tsx` — chips/filter pills
- Select buttons and floating panels

**Do not** apply glass to cards.

## Key Components

**`header/`** — Fixed glass navbar. Changes affect the entire site. It reads from `config/menu-items.ts` for navigation links.

**`main-container/`** — Shared layout wrapper used across every page and inside the header. Changes here affect global layout rhythm.

**`parsing/`** — Renders HTML from PocketBase CMS (`html-react-parser`). Do not change the output contract of these components; they must faithfully render CMS content. `Prose.tsx` wraps content in Chakra's prose styles.

**`footer/`** — Receives social/contact URLs as props from `src/app/layout.tsx`.

**`tags/`** — `Tags.tsx` renders tag display; `TagSelect.tsx` renders filterable tag checkboxes with glass chip treatment.

**`link/`** — Variants for nav links (`NavLink`), icon button links (`IconButtonLink`), heading anchor links (`HeadingLink`), and the resume download button (`ResumeButton`).

## Variable / Function Naming

`camelCase`, descriptive. Avoid vague names like `data2`, `temp`, `thing`.
