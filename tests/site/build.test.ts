import { access } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { publicDirectory } from "./build-site.js";

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
  it("renders the permanent flat route structure", async () => {
    await expectFile("project-one/index.html");
    await expectFile("writing-one/index.html");
    await expectNoFile("about/index.html");
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
