# App Routes

This directory contains all Next.js App Router pages and the root layout.

## Route Map

| Route | File | Purpose |
|---|---|---|
| `/` | `page.tsx` | Home / portfolio landing |
| `/blog` | `blog/page.tsx` | Blog listing with tag filter |
| `/blog/[slug]` | `blog/[slug]/page.tsx` | Individual post with Giscus comments |
| `/projects` | `projects/page.tsx` | Project showcase listing |
| `*` | `not-found.tsx` | 404 page |

`layout.tsx` is the root layout: wraps all pages in `<Header>`, `<MainContainer>`, and `<Footer>`.

## Preserve

- Page purposes and information architecture
- PocketBase data fetching patterns
- Giscus comments integration on blog posts
- `fetchCache = "force-no-store"` in `layout.tsx` — this is intentional so the resume URL fetched from PocketBase is always fresh

## Data

All CMS content comes from PocketBase via `src/pocketbase-lib/`. Do not replace or bypass this data layer.

## Overhaul Scope

During the visual overhaul, pages may receive updated layouts and component usage. Do not change what a page does or what data it fetches — only how it looks.
