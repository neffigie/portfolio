import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      "packages/*",
      {
        test: {
          globalSetup: ["tests/site/global-setup.ts"],
          include: ["tests/**/*.test.ts"],
          name: "site",
          root: ".",
        },
      },
    ],
  },
});
