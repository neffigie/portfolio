import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { load } from "cheerio";
import { beforeAll, describe, expect, it } from "vitest";

import { buildSite, publicDirectory } from "./build-site.js";

async function page(route: string) {
  return load(await readFile(join(publicDirectory, route, "index.html"), "utf8"));
}

describe("content-specific views", () => {
  beforeAll(buildSite, 30_000);

  it("renders the complete authored Home body without a duplicate summary", async () => {
    const $ = await page("");
    expect($(".home-introduction .prose p")).toHaveLength(3);
    expect($(".home-introduction .prose").text()).toContain(
      "Software engineer building durable publishing and search systems.",
    );
    expect($(".home-callout")).toHaveLength(0);
  });

  it("uses derived opening prose in index and pinned rows", async () => {
    const index = await page("index");
    expect(index("[data-result-preview]").first().text()).toContain(
      "Canonical snapshots keep deployments reproducible",
    );
    expect(index("[data-result-preview]").first().text()).not.toContain(
      "deterministic system",
    );

    const home = await page("");
    expect(home("[data-pinned-entry] p").first().text()).toContain(
      "The index is the information architecture",
    );
  });

  it("keeps entry and résumé pages free of an auto-generated subtitle", async () => {
    const entry = await page("project-one");
    expect(entry(".entry-summary")).toHaveLength(0);
    expect(entry(".entry .prose").text()).toContain(
      "Canonical snapshots keep deployments reproducible",
    );

    const resume = await page("resume");
    expect(resume(".entry-summary")).toHaveLength(0);
    expect(resume(".resume-download")).toHaveLength(1);
  });
});
