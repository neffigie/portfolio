// @vitest-environment happy-dom

import { beforeEach, describe, expect, it } from "vitest";

import type { SearchResponse } from "../src/pagefind.js";
import { DomSearchView } from "../src/view.js";

const oneResult: SearchResponse = {
  total: 1,
  hasMore: false,
  results: [
    {
      url: "/project-one/",
      title: "Publication Compiler",
      summary: "A durable pipeline.",
      excerpt: "Compiler",
      type: "project",
      date: "2026-09-20",
      tags: ["AWS"],
    },
  ],
};

function required<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing fixture element: ${selector}`);
  return element;
}

function surface(): HTMLElement {
  document.body.innerHTML = `<section data-search-surface>
    <form data-search-filters>
      <input type="search" data-search-query>
      <select data-search-type><option value=""></option><option value="project">Project</option></select>
      <input data-search-tag>
      <select data-search-sort><option value="newest">Newest</option><option value="relevance">Relevance</option></select>
    </form>
    <p role="status" aria-live="polite" data-search-status></p>
    <ul data-search-results></ul>
    <button data-search-more hidden>Show more</button>
    <template data-search-pins><li data-pinned-entry><a href="/project-one/">Pinned project</a></li></template>
  </section>`;
  const root = document.querySelector<HTMLElement>("[data-search-surface]");
  if (!root) throw new Error("Missing search surface");
  return root;
}

describe("shared DOM search view", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("reads comma-separated tags into shared state", () => {
    const root = surface();
    required<HTMLInputElement>(root, "[data-search-query]").value = "compiler";
    required<HTMLSelectElement>(root, "[data-search-type]").value = "project";
    required<HTMLInputElement>(root, "[data-search-tag]").value =
      " AWS, Systems, aws ";

    expect(new DomSearchView(root).readState()).toEqual({
      query: "compiler",
      type: "project",
      tags: ["AWS", "Systems"],
      sort: "relevance",
    });
  });

  it("renders pins, results, loading, and live status in one surface", () => {
    const root = surface();
    const view = new DomSearchView(root);

    view.renderPins();
    expect(root.querySelector("[data-pinned-entry]")?.textContent).toContain(
      "Pinned project",
    );

    view.renderLoading();
    expect(root.getAttribute("aria-busy")).toBe("true");
    view.renderResults(oneResult);
    view.announce("1 result");
    expect(root.getAttribute("aria-busy")).toBeNull();
    expect(root.querySelector("[data-search-results] a")?.textContent).toBe(
      "Publication Compiler",
    );
    expect(root.querySelector("[role='status']")?.textContent).toBe("1 result");
  });

  it("appends later batches and toggles the more control", () => {
    const root = surface();
    const view = new DomSearchView(root);
    const more = required<HTMLButtonElement>(root, "[data-search-more]");

    const firstResult = oneResult.results.at(0);
    if (!firstResult) throw new Error("Missing result fixture");

    view.renderResults({ ...oneResult, total: 2, hasMore: true });
    expect(more.hidden).toBe(false);
    view.renderResults(
      {
        ...oneResult,
        hasMore: false,
        results: [{ ...firstResult, title: "Second entry" }],
      },
      true,
    );
    expect(root.querySelectorAll("[data-search-results] > li")).toHaveLength(2);
    expect(more.hidden).toBe(true);
  });
});
