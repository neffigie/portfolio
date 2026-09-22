import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { load } from "cheerio";
import { beforeAll, describe, expect, it } from "vitest";

import { buildSite, publicDirectory } from "./build-site.js";

describe("Pagefind entry markup", () => {
  beforeAll(buildSite, 30_000);

  it("indexes only published entry content", async () => {
    for (const route of ["project-one", "writing-one"]) {
      const $ = load(
        await readFile(join(publicDirectory, route, "index.html"), "utf8"),
      );
      expect($("[data-pagefind-body]")).toHaveLength(1);
    }

    for (const route of ["", "resume", "index"]) {
      const file = route ? join(route, "index.html") : "index.html";
      const $ = load(await readFile(join(publicDirectory, file), "utf8"));
      expect($("[data-pagefind-body]")).toHaveLength(0);
    }
  });

  it("emits searchable metadata, filters, and sort keys", async () => {
    const $ = load(
      await readFile(join(publicDirectory, "project-one/index.html"), "utf8"),
    );

    expect($("[data-pagefind-meta='title']").text()).toBe(
      "Publication Compiler",
    );
    expect(
      $("meta[data-pagefind-meta='preview[content]']").attr("content"),
    ).toContain("Canonical snapshots keep deployments reproducible");
    expect($("[data-pagefind-filter='type']").text()).toBe("project");
    expect(
      $("[data-pagefind-filter='tag']")
        .toArray()
        .map((element) => $(element).text()),
    ).toEqual(["TypeScript", "AWS", "Systems"]);
    expect($("[data-pagefind-sort='date[datetime]']").attr("datetime")).toBe(
      "2026-09-20",
    );
    expect($("[data-pagefind-sort='title']").text()).toBe(
      "Publication Compiler",
    );
    expect($("meta[data-pagefind-meta='tags[content]']").attr("content")).toBe(
      '["TypeScript","AWS","Systems"]',
    );
  });

  it("builds a static Pagefind bundle beside the HTML", async () => {
    const script = await readFile(
      join(publicDirectory, "pagefind/pagefind.js"),
      "utf8",
    );
    expect(script.length).toBeGreaterThan(100);
  });
});
