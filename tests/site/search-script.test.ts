import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { load } from "cheerio";
import { beforeAll, describe, expect, it } from "vitest";

import { buildSite, publicDirectory } from "./build-site.js";

describe("built search client", () => {
  beforeAll(buildSite, 30_000);

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

  it("embeds authored pins for empty Search Everywhere without a network request", async () => {
    const $ = load(await readFile(join(publicDirectory, "index.html"), "utf8"));
    expect($("[data-search-dialog] template[data-search-pins]")).toHaveLength(
      1,
    );
    expect(
      $("[data-search-dialog] template[data-search-pins]")
        .html()
        ?.indexOf("Search as Navigation"),
    ).toBeGreaterThan(-1);
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
