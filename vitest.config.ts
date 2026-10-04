import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      "packages/*",
      {
        test: {
          include: ["tests/pocketbase/**/*.test.ts"],
          name: "pocketbase-hooks",
          root: ".",
        },
      },
    ],
  },
});
