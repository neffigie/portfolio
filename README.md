# neffigie.com
Anna Noelle's portfolio at [https://muhakushi.com]() built with [Next.js](https://nextjs.org/) and hosted by  [AWS Amplify](https://aws.amazon.com/amplify/). 

## 🐈 Installation using Yarn

1. Install Next.js

```bash 
yarn add next@latest react@latest react-dom@latest
```

2. Install dependencies

```bash 
yarn 
```

3. Run the development server

```bash
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. 

## ⚙️ Environment
You need to create a `.env.local` file in the root directory with the following configuration: 

```bash
# POCKETBASE (https://pocketbase.io/)
NEXT_PUBLIC_POCKETBASE_URL="https://..."

# GISCUS (https://github.com/giscus/giscus-component)
NEXT_PUBLIC_GISCUS_REPOSITORY="Username/repository"
NEXT_PUBLIC_GISCUS_REPOSITORY_ID="id"
NEXT_PUBLIC_GISCUS_CATEGORY="category"
NEXT_PUBLIC_GISCUS_CATEGORY_ID="id"
NEXT_PUBLIC_GISCUS_MAPPING="url, title, specific, number, or pathname"
NEXT_PUBLIC_GISCUS_STRICT="0 or 1"
NEXT_PUBLIC_GISCUS_REACTIONS_ENABLED="0 or 1"
```

The validation for `NEXT_PUBLIC_...` variables are located in [environment.ts](src/environment/environment.ts). The validation schema is powered by [Zod](https://github.com/colinhacks/zod).

## 🚀 Deploy on AWS Amplify

See [this](https://docs.amplify.aws/guides/hosting/nextjs/q/platform/js/#deploy-and-host-a-hybrid-app-ssg-and-ssr) AWS Amplify hosting tutorial. An [amplify.yml](amplify.yml) file is already configured for this app. 

There are currently limitations of hosting a Next.js app on Amplify: 

> Unsupported features
> * Edge API Routes (Edge middleware is not supported)
> * On-Demand Incremental Static Regeneration (ISR)
> * Internationalized (i18n) automatic locale detection 
>
> https://docs.aws.amazon.com/amplify/latest/userguide/ssr-Amplify-support.html. 

## ❓ Miscellaneous

### Pocketbase Type Generation

When modifying the source, you may optionally create this `.env` file in the root directory to use [Pocketbase Typegen](https://github.com/patmood/pocketbase-typegen). 

```bash
PB_TYPEGEN_URL="https://..."
PB_TYPEGEN_EMAIL="email"
PB_TYPEGEN_PASSWORD="password"
```

Then, run `yarn typegen` to generate a Pocketbase types `pocketbase-types.ts` file in the same directory.

### Linting on Visual Studio Code

This project uses [Prettier](https://github.com/prettier/prettier) in combination with [ESLint](https://github.com/eslint/eslint) to format TypeScript code. A [.eslintrc.json](.eslintrc.json) and [settings.json](.vscode/settings.json) file (for Prettier) has already been created in the root directory. To get started **using Visual Studio Code**, install the Prettier and ESLint extensions, then edit and save a file.

You may also edit the `.eslintrc.json` **as long as `"prettier"` is not removed from the `"extends"` array**. To ensure any added rules are neccessary and do not conflict with Prettier, run the [CLI helper tool](https://github.com/prettier/eslint-config-prettier#cli-helper-tool). For example: 

```bash 
npx eslint-config-prettier src/app/page.tsx
```

Note: 
> Usually you’ll have about the same rules for all files, so it is good enough to run the command on one file. But if you use multiple configuration files or overrides, you can provide several files
https://github.com/prettier/eslint-config-prettier#cli-helper-tool

## ✍️ Contributions 

Your feedback and contributions are welcome! Feel free to fork this repository with **proper attribution**.