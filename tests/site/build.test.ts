import { spawnSync } from "node:child_process";
import { access, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { beforeAll, describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));
const publicDirectory = fileURLToPath(
  new URL("../../site/public/", import.meta.url),
);

function buildSite(): void {
  const result = spawnSync("npm", ["run", "build:site"], {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: process.env,
  });
  expect(
    result.status,
    [result.stdout, result.stderr].filter(Boolean).join("\n"),
  ).toBe(0);
}

async function expectFile(path: string): Promise<void> {
  await expect(
    access(new URL(path, `file://${publicDirectory}/`)),
  ).resolves.toBe(undefined);
}

async function expectNoFile(path: string): Promise<void> {
  await expect(
    access(new URL(path, `file://${publicDirectory}/`)),
  ).rejects.toThrow();
}

describe("Hugo publication build", () => {
  beforeAll(async () => {
    await rm(publicDirectory, { recursive: true, force: true });
    buildSite();
  }, 30_000);

  it("renders the permanent flat route structure", async () => {
    await expectFile("project-one/index.html");
    await expectFile("writing-one/index.html");
    await expectFile("about/index.html");
    await expectFile("resume/index.html");
    await expectFile("index/index.html");
    await expectFile("404.html");
  });

  it("does not recreate the retired tiered routes", async () => {
    await expectNoFile("blog/index.html");
    await expectNoFile("projects/index.html");
    await expectNoFile("search/index.html");
  });
});
