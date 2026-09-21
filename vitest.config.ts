import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      "packages/*",
      {
        test: {
          fileParallelism: false,
          include: ["tests/**/*.test.ts"],
          name: "site",
          root: ".",
        },
      },
    ],
  },
});
