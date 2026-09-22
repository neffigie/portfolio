// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from "vitest";

import { mountIndexPage } from "../src/index-page.js";
import type { SearchResponse } from "../src/pagefind.js";
import type { SearchState } from "../src/state.js";

const empty: SearchResponse = { total: 0, results: [], hasMore: false };

function required<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing fixture element: ${selector}`);
  return element;
}

function fixture(): HTMLElement {
  document.body.innerHTML = `<main data-index-root>
    <form data-search-filters>
      <input type="search" data-search-query>
      <select data-search-type><option value=""></option><option value="project">Project</option></select>
      <div data-tag-picker><div data-tag-pills></div><details><summary>Add tags</summary>
        <input type="search" data-tag-filter>
        <label><input type="checkbox" value="AWS" data-tag-option>AWS</label>
        <label><input type="checkbox" value="Systems" data-tag-option>Systems</label>
        <p data-tag-empty hidden>No matching tags.</p>
      </details></div>
      <select data-search-sort><option value="newest">Newest</option><option value="title">Title</option><option value="relevance">Relevance</option></select>
    </form>
    <p role="status" aria-live="polite" data-search-status></p>
      <ul data-search-results></ul>
      <button data-search-more hidden>Show more</button>
  </main>`;
  return required(document, "[data-index-root]");
}

describe("index page lifecycle", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/index/");
    document.body.innerHTML = "";
  });

  it("loads the newest unfiltered corpus by default", async () => {
    const states: SearchState[] = [];
    mountIndexPage(fixture(), async (state) => {
      states.push(state);
      return empty;
    });

    await vi.waitFor(() => expect(states).toHaveLength(1));
    expect(states[0]).toMatchObject({ query: "", sort: "newest" });
    expect(document.querySelector("[role='status']")?.textContent).toBe(
      "No results",
    );
  });

  it("reconstructs filters from an index URL and replaces state on input", async () => {
    window.history.replaceState(
      {},
      "",
      "/index/?q=compiler&type=project&tag=AWS&tag=Systems&sort=title",
    );
    const states: SearchState[] = [];
    const root = fixture();
    mountIndexPage(root, async (state) => {
      states.push(state);
      return empty;
    });

    await vi.waitFor(() => expect(states).toHaveLength(1));
    expect(states[0]).toEqual({
      query: "compiler",
      type: "project",
      tags: ["AWS", "Systems"],
      sort: "title",
    });
    expect(
      [
        ...root.querySelectorAll<HTMLButtonElement>("[data-tag-pills] button"),
      ].map((button) => button.dataset.removeTag),
    ).toEqual(["AWS", "Systems"]);

    const query = required<HTMLInputElement>(root, "[data-search-query]");
    query.value = "search";
    query.dispatchEvent(new Event("input", { bubbles: true }));
    await vi.waitFor(() => expect(states).toHaveLength(2));
    expect(window.location.search).toBe(
      "?q=search&type=project&tag=AWS&tag=Systems&sort=title",
    );
  });

  it("updates the shareable URL when tag pills are added or removed", async () => {
    const states: SearchState[] = [];
    const root = fixture();
    mountIndexPage(root, async (state) => {
      states.push(state);
      return empty;
    });
    await vi.waitFor(() => expect(states).toHaveLength(1));

    const option = required<HTMLInputElement>(
      root,
      '[data-tag-option][value="AWS"]',
    );
    option.checked = true;
    option.dispatchEvent(new Event("change", { bubbles: true }));
    await vi.waitFor(() => expect(states).toHaveLength(2));
    expect(window.location.search).toBe("?tag=AWS");
    expect(root.querySelectorAll("[data-tag-pills] button")).toHaveLength(1);

    const filter = required<HTMLInputElement>(root, "[data-tag-filter]");
    filter.value = "sys";
    filter.dispatchEvent(new Event("input", { bubbles: true }));
    expect(states).toHaveLength(2);

    required<HTMLButtonElement>(root, '[data-remove-tag="AWS"]').click();
    await vi.waitFor(() => expect(states).toHaveLength(3));
    expect(window.location.search).toBe("");
  });

  it("restores state when browser history changes", async () => {
    const states: SearchState[] = [];
    const root = fixture();
    mountIndexPage(root, async (state) => {
      states.push(state);
      return empty;
    });
    await vi.waitFor(() => expect(states).toHaveLength(1));

    window.history.pushState({}, "", "/index/?type=project&tag=AWS");
    window.dispatchEvent(new PopStateEvent("popstate"));

    await vi.waitFor(() => expect(states).toHaveLength(2));
    expect(states[1]).toMatchObject({ type: "project", tags: ["AWS"] });
    expect(
      root.querySelector<HTMLSelectElement>("[data-search-type]")?.value,
    ).toBe("project");
  });

  it("drops an old explicit sort when returning to an unsorted URL", async () => {
    const states: SearchState[] = [];
    const root = fixture();
    window.history.replaceState({}, "", "/index/?q=first&sort=newest");
    mountIndexPage(root, async (state) => {
      states.push(state);
      return empty;
    });
    await vi.waitFor(() => expect(states).toHaveLength(1));

    window.history.pushState({}, "", "/index/?q=second");
    window.dispatchEvent(new PopStateEvent("popstate"));
    await vi.waitFor(() => expect(states).toHaveLength(2));
    expect(states[1]?.sort).toBe("relevance");

    const query = required<HTMLInputElement>(root, "[data-search-query]");
    query.value = "";
    query.dispatchEvent(new Event("input", { bubbles: true }));
    await vi.waitFor(() => expect(states).toHaveLength(3));
    query.value = "third";
    query.dispatchEvent(new Event("input", { bubbles: true }));
    await vi.waitFor(() => expect(states).toHaveLength(4));
    expect(states[3]?.sort).toBe("relevance");
  });

  it("runs one search when a select emits input and change", async () => {
    const states: SearchState[] = [];
    const root = fixture();
    mountIndexPage(root, async (state) => {
      states.push(state);
      return empty;
    });
    await vi.waitFor(() => expect(states).toHaveLength(1));

    const type = required<HTMLSelectElement>(root, "[data-search-type]");
    type.value = "project";
    type.dispatchEvent(new Event("input", { bubbles: true }));
    type.dispatchEvent(new Event("change", { bubbles: true }));
    await vi.waitFor(() => expect(states).toHaveLength(2));
  });
});
