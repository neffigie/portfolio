# Anna Noelle Portfolio

The source for [neffigie.com](https://neffigie.com/), a static personal reference site for my work, writing, and résumé.

PocketBase is the authoring environment. The TypeScript publisher compiles its content into a validated, canonical snapshot; Hugo renders that snapshot into the site; and Pagefind creates the client-side search index. The generated site is intended for AWS Amplify hosting and does not depend on PocketBase at request time.

## Requirements

- Node.js 24.21.0
- Hugo 0.166.0

Install the JavaScript dependencies with:

```sh
npm install
```

## Commands

```sh
npm run build:site  # build the fixture snapshot, Hugo site, and Pagefind index
npm run preview     # fetch PocketBase, rebuild, and serve the fresh site locally
npm run preview:fixture  # serve the deterministic fixture build locally
npm run check       # lint, type-check, and run unit/integration tests
npm run check:site  # build and run browser tests
```

## Structure

- `packages/publisher` — validates source content, transforms authored HTML, publishes media, and writes the canonical snapshot
- `packages/search` — shared search state, Pagefind adapter, index-page UI, and Search Everywhere UI
- `site` — Hugo layouts, styles, and generated publication inputs
- `scripts` — build and local-preview entry points
- `fixtures` — deterministic content and assets used by the local build
- `tests` — rendered-site and browser-level checks

Generated publication data, search bundles, media, and `site/public` are intentionally ignored. The checked-in Amplify configuration currently fails closed until the production publication pipeline is connected.
