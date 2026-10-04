import { spawnSync } from "node:child_process";
import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));
export const publicDirectory = fileURLToPath(
  new URL("../../site/public/", import.meta.url),
);

export async function buildSite(): Promise<void> {
  await rm(publicDirectory, { recursive: true, force: true });
  const result = spawnSync("npm", ["run", "build:site"], {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(
      [result.stdout, result.stderr].filter(Boolean).join("\n") ||
        `Site build exited with status ${result.status ?? "unknown"}`,
    );
  }
}
