# neffigie.com

Anna Noelle's portfolio at [https://www.muhakushi.com](https://www.muhakushi.com) built with [Next.js](https://nextjs.org/) and hosted by [AWS Amplify](https://aws.amazon.com/amplify/).

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
NEXT_PUBLIC_POCKETBASE_URL="url"
NEXT_PUBLIC_POCKETBASE_RESUME_FILE_ID="id"
NEXT_PUBLIC_POCKETBASE_RESUME_FILE_NAME="name.extension"

# GISCUS COMPONENT (https://github.com/giscus/giscus-component)
# As of 2.3.0, set strict to 1 if using the pathname mapping.
NEXT_PUBLIC_GISCUS_REPOSITORY="Username/repository"
NEXT_PUBLIC_GISCUS_REPOSITORY_ID="id"
NEXT_PUBLIC_GISCUS_CATEGORY="category"
NEXT_PUBLIC_GISCUS_CATEGORY_ID="id"
NEXT_PUBLIC_GISCUS_MAPPING="url, title, specific, number, or pathname"
NEXT_PUBLIC_GISCUS_STRICT="0 or 1"
NEXT_PUBLIC_GISCUS_REACTIONS_ENABLED="0 or 1"

# PERSONAL LINKS (all optional)
NEXT_PUBLIC_EMAIL="email"
NEXT_PUBLIC_LINKEDIN_URL="url"
NEXT_PUBLIC_GITHUB_URL="url"
NEXT_PUBLIC_ITCH_URL="url"

# SITE CONFIG
NEXT_PUBLIC_METADATA_BASE="url"
NEXT_PUBLIC_METADATA_AUTHOR="Your name"
NEXT_PUBLIC_METADATA_SITE_NAME="name"
NEXT_PUBLIC_METADATA_DESCRIPTION="description"
```

The validation for `NEXT_PUBLIC_...` variables are located in [environment.ts](src/environment/environment.ts). The validation schema is powered by [Zod](https://github.com/colinhacks/zod).

## 🌎 PocketBase Schema

This project uses [PocketBase](https://pocketbase.io/) as the database. Please ensure you have the following the schema.

### The Base System Record

Every record in PocketBase, including the ones below, automatically has the following fields. Ensure your database includes the fields or create them.

| Base System Record |          |
| ------------------ | -------- |
| id                 | ID       |
| created            | ISO Date |
| updated            | ISO Date |

### Project-Specfic Records

| categories        |             |                   |
| ----------------- | ----------- | ----------------- |
| name              | Plain Text  | The category name |
| short_description | Plain Text  | unused            |
| long_description  | Rich Editor | unused            |

| files |            |               |
| ----- | ---------- | ------------- |
| name  | Plain Text | The file name |
| field | File       | The file      |

| posts       |                          |                                                              |
| ----------- | ------------------------ | ------------------------------------------------------------ |
| slug        | [^\s-]                   | The slug this post should display on (i.e. .../posts/[slug]) |
| title       | Plain Text               |                                                              |
| description | Plain Text               |                                                              |
| image       | Single Image             | The image that shows on the preview card and post page       |
| image_alt   | Plain Text               | Image alt text                                               |
| date        | ISO Date                 | The date of publication                                      |
| body        | Rich Editor              | The post body                                                |
| categories  | categories Relationships | The categories of this post                                  |
| legacy      | Boolean                  | Whether or not this post is outdated. Shows a warning        |

| projects    |                          |                                |
| ----------- | ------------------------ | ------------------------------ |
| date        | ISO Date                 | The date                       |
| title       | Plain Text               |                                |
| description | Plain Text               |                                |
| banner      | Single Image             | The image that shows on card   |
| url         | URL                      | The external project page      |
| categories  | categories Relationships | The categories of this project |

_Plain Text is and Rich Editor are both strings, with Rich Editor specifically being HTML. If using PocketBase, pay extra attention when pasting text directly into the Rich Editor, since it will preserve formatting in this application, too._

### Changing or Editing the Database

You can delete the `src/pocketbase-lib` folder when using another database than PocketBase, since it's only used for bringing extra type-features to the existing PocketBase SDK.

Regardless, you can change and edit the database by modifying the [database.ts](src/config/database.ts) file.

## 🚀 Deploy on AWS Amplify

See [this](https://docs.amplify.aws/guides/hosting/nextjs/q/platform/js/#deploy-and-host-a-hybrid-app-ssg-and-ssr) AWS Amplify hosting tutorial. An [amplify.yml](amplify.yml) file is already configured for this app.

There are currently limitations of hosting a Next.js app on Amplify:

> Unsupported features
>
> -   Edge API Routes (Edge middleware is not supported)
> -   On-Demand Incremental Static Regeneration (ISR)
> -   Internationalized (i18n) automatic locale detection
>
> https://docs.aws.amazon.com/amplify/latest/userguide/ssr-Amplify-support.html.

_Please use Next.js 13.0 - 13.5. Right now Next.js 14 and higher is not supported by AWS. It requires Node ^18.17. In you Build Settings, make sure you are using node version ^18.17. You can do this by going to Build Settings > Edit Build image settings > Live Package updates. However, GLIBC_2.27 is required and not currently available for AWS, and this is, most likely, one of many issues._

## ❓ Miscellaneous

### Linting on Visual Studio Code

This project uses [Prettier](https://github.com/prettier/prettier) in combination with [ESLint](https://github.com/eslint/eslint) to format TypeScript code. A [.eslintrc.json](.eslintrc.json) and [settings.json](.vscode/settings.json) file (for Prettier) has already been created in the root directory. To get started **using Visual Studio Code**, install the Prettier and ESLint extensions, then edit and save a file.

You may also edit the `.eslintrc.json` **as long as `"prettier"` is not removed from the `"extends"` array**. To ensure any added rules are neccessary and do not conflict with Prettier, run the [CLI helper tool](https://github.com/prettier/eslint-config-prettier#cli-helper-tool). For example:

```bash
npx eslint-config-prettier src/app/page.tsx
```

Note:

> Usually you’ll have about the same rules for all files, so it is good enough to run the command on one file. But if you use multiple configuration files or overrides, you can provide several files
> https://github.com/prettier/eslint-config-prettier#cli-helper-tool

## ✍️ Contributions

Your feedback and contributions are welcome! Feel free to fork this repository with **proper attribution**.
