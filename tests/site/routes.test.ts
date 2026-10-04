import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { load } from "cheerio";
import { describe, expect, it } from "vitest";

import { publicDirectory, repositoryRoot } from "./build-site.js";

interface RouteExpectation {
  file: string;
  canonical: string;
}

const routes: RouteExpectation[] = [
  { file: "index.html", canonical: "https://neffigie.dev/" },
  { file: "index/index.html", canonical: "https://neffigie.dev/index/" },
  { file: "resume/index.html", canonical: "https://neffigie.dev/resume/" },
  {
    file: "project-one/index.html",
    canonical: "https://neffigie.dev/project-one/",
  },
  { file: "404.html", canonical: "https://neffigie.dev/404.html" },
];

async function html(path: string): Promise<string> {
  return readFile(join(publicDirectory, path), "utf8");
}

function headingLevels(document: string): number[] {
  const $ = load(document);
  return $("h1, h2, h3, h4, h5, h6")
    .toArray()
    .map((heading) => Number(heading.tagName.slice(1)));
}

describe("permanent route semantics", () => {
  it.each(routes)("renders landmarks and metadata for $file", async (route) => {
    const $ = load(await html(route.file));

    expect($("main")).toHaveLength(1);
    expect($("h1")).toHaveLength(1);
    expect($("body > header.site-header")).toHaveLength(1);
    expect($("header.site-header nav[aria-label='Primary']")).toHaveLength(1);
    expect($("body > footer.site-footer")).toHaveLength(1);
    expect($("link[rel='canonical']").attr("href")).toBe(route.canonical);
  });

  it.each(routes)("does not skip heading levels in $file", async (route) => {
    const levels = headingLevels(await html(route.file));
    expect(levels[0]).toBe(1);
    for (let index = 1; index < levels.length; index += 1) {
      expect(levels[index]).toBeLessThanOrEqual((levels[index - 1] ?? 1) + 1);
    }
  });

  it("orders the homepage around identity, authored context, and pins", async () => {
    const document = await html("index.html");
    const $ = load(document);
    const text = $("main").text();

    expect($("h1").text()).toBe("Anna Noelle");
    expect(text).toContain(
      "Software engineer building durable publishing and search systems.",
    );
    expect(text).toContain("calm infrastructure");
    expect(text).toContain("fieldnotes");
    expect($("a[href='/about/']")).toHaveLength(0);
    expect($("main a[href='/resume/']")).toHaveLength(1);
    expect($("header a[href='/index/']")).toHaveLength(1);
    expect($("header [data-search-open]")).toHaveLength(1);
    expect($("main a[href='/index/']")).toHaveLength(0);
    expect($("main [data-search-open]")).toHaveLength(0);
    expect($("#home-search-title")).toHaveLength(0);

    const pinnedTitles = $("main [data-pinned-entry]")
      .toArray()
      .map((row) => $(row).find("a").first().text().trim());
    expect(pinnedTitles).toEqual([
      "Search as Navigation",
      "Publication Compiler",
    ]);
  });

  it("renders stable search hooks on both search surfaces", async () => {
    const home = load(await html("index.html"));
    const index = load(await html("index/index.html"));

    expect(home("dialog[data-search-dialog]")).toHaveLength(1);
    expect(home("[data-search-dialog] [data-search-filters]")).toHaveLength(1);
    expect(home("[data-search-dialog] [data-search-results]")).toHaveLength(1);
    expect(index("[data-index-root]")).toHaveLength(1);
    expect(index("[data-index-root] [data-search-filters]")).toHaveLength(1);
    expect(index("[data-index-root] [data-search-results]")).toHaveLength(1);
  });

  it("offers each published tag once in the full index", async () => {
    const $ = load(await html("index/index.html"));
    expect(
      $("[data-index-root] [data-tag-picker] [data-tag-option]")
        .toArray()
        .map((element) => $(element).val()),
    ).toEqual(["AWS", "Search", "Systems", "TypeScript"]);
    expect($("[data-index-root] [data-search-tag]")).toHaveLength(0);
  });

  it("keeps the résumé route stable while linking the published asset", async () => {
    const $ = load(await html("resume/index.html"));
    const href = $("a[download]").attr("href");

    expect(href).toMatch(
      /^\/assets\/resume\/[0-9a-f]{64}\/anna-noelle-resume\.pdf$/u,
    );
    expect($.html().toLowerCase()).not.toContain("pocketbase");
  });

  it("renders the static social links as labeled monochrome icons", async () => {
    const $ = load(await html("index.html"));
    const socialLinks = $("footer nav[aria-label='Social links'] a");

    expect(
      socialLinks.toArray().map((link) => ({
        label: $(link).attr("aria-label"),
        href: $(link).attr("href"),
      })),
    ).toEqual([
      { label: "Email", href: "mailto:neffigie@gmail.com" },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/anna-noelle/",
      },
      { label: "GitHub", href: "https://github.com/neffigie" },
    ]);
    expect(socialLinks.find("svg[aria-hidden='true']")).toHaveLength(3);
    expect(socialLinks.first().find("svg[fill='none']")).toHaveLength(1);
  });

  it("loads the permanent CSS layer contract", async () => {
    const $ = load(await html("index.html"));
    const layers = await readFile(
      join(repositoryRoot, "site/assets/css/layers.css"),
      "utf8",
    );

    expect($("link[rel='stylesheet']")).toHaveLength(1);
    expect(layers.trimStart()).toMatch(
      /^@layer reset, tokens, base, layout, components, utilities, states;/u,
    );
  });
});
