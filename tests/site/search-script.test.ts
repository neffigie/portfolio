import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { load } from "cheerio";
import { describe, expect, it } from "vitest";

import { publicDirectory } from "./build-site.js";

describe("built search client", () => {
  it("ships one module client on every public route", async () => {
    for (const route of [
      "index.html",
      "index/index.html",
      "project-one/index.html",
    ]) {
      const $ = load(await readFile(join(publicDirectory, route), "utf8"));
      const script = $("script[type='module'][src^='/js/search.']");
      expect(script).toHaveLength(1);
      const src = script.attr("src");
      if (!src) throw new Error("Missing search script URL");
      expect(
        (await readFile(join(publicDirectory, src), "utf8")).length,
      ).toBeGreaterThan(100);
    }
  });

  it("ships a query-only Search Everywhere dialog", async () => {
    const $ = load(await readFile(join(publicDirectory, "index.html"), "utf8"));
    expect($("[data-search-dialog] [data-search-query]")).toHaveLength(1);
    expect($("[data-search-dialog] [data-search-type]")).toHaveLength(0);
    expect($("[data-search-dialog] [data-tag-picker]")).toHaveLength(0);
    expect($("[data-search-dialog] [data-search-sort]")).toHaveLength(0);
    expect($("[data-search-dialog] [data-search-pins]")).toHaveLength(0);
    expect($("[data-search-dialog] [data-search-view-index]")).toHaveLength(0);
  });

  it("renders the complete newest-first index before JavaScript runs", async () => {
    const $ = load(
      await readFile(join(publicDirectory, "index/index.html"), "utf8"),
    );
    expect(
      $("[data-search-results] > li a")
        .toArray()
        .map((anchor) => $(anchor).text()),
    ).toEqual(["Publication Compiler", "Search as Navigation"]);
  });
});
