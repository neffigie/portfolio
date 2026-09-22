// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from "vitest";

import { mountOverlay } from "../src/overlay.js";
import type { SearchResponse } from "../src/pagefind.js";

const oneResult: SearchResponse = {
  total: 1,
  hasMore: false,
  results: [
    {
      url: "/project-one/",
      title: "Publication Compiler",
      supportingText: "A durable pipeline.",
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

function fixture(): { dialog: HTMLDialogElement; launcher: HTMLButtonElement } {
  document.body.innerHTML = `<button data-search-open>Search</button>
    <input id="other-input">
    <dialog data-search-dialog>
      <button data-search-close>Close</button>
      <form data-search-filters>
        <input type="search" data-search-query>
        <select data-search-type><option value=""></option><option value="project">Project</option></select>
        <div data-tag-picker><div data-tag-pills></div><details><summary>Add tags</summary>
          <input type="search" data-tag-filter>
          <label><input type="checkbox" value="AWS" data-tag-option>AWS</label>
          <p data-tag-empty hidden>No matching tags.</p>
        </details></div>
        <select data-search-sort><option value="newest">Newest</option><option value="relevance">Relevance</option></select>
      </form>
      <p role="status" aria-live="polite" data-search-status></p>
      <ul data-search-results></ul>
      <template data-search-pins><li data-pinned-entry>Pinned project</li></template>
      <a data-search-view-index href="/index/">View in Index</a>
    </dialog>`;
  return {
    dialog: required(document, "[data-search-dialog]"),
    launcher: required(document, "[data-search-open]"),
  };
}

describe("Search Everywhere lifecycle", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("opens from the launcher, shows pins, and restores focus on close", async () => {
    const { dialog, launcher } = fixture();
    mountOverlay(dialog, async () => oneResult);
    launcher.focus();
    launcher.click();

    expect(dialog.open).toBe(true);
    expect(document.activeElement).toBe(
      dialog.querySelector("[data-search-query]"),
    );
    expect(dialog.querySelector("[data-pinned-entry]")).not.toBeNull();
    required<HTMLButtonElement>(dialog, "[data-search-close]").click();
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(launcher);
  });

  it("supports Ctrl+K and Meta+K but ignores editable fields", () => {
    const { dialog } = fixture();
    mountOverlay(dialog, async () => oneResult);
    document.body.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }),
    );
    expect(dialog.open).toBe(true);
    dialog.close();

    const otherInput = required<HTMLInputElement>(document, "#other-input");
    otherInput.focus();
    otherInput.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }),
    );
    expect(dialog.open).toBe(false);

    document.body.focus();
    document.body.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
    );
    expect(dialog.open).toBe(true);
  });

  it("handles Escape, repeated opening, and state transfer to Index", async () => {
    const { dialog, launcher } = fixture();
    mountOverlay(dialog, async () => oneResult);
    launcher.click();
    const query = required<HTMLInputElement>(dialog, "[data-search-query]");
    query.value = "compiler";
    query.dispatchEvent(new Event("input", { bubbles: true }));
    await vi.waitFor(() =>
      expect(dialog.querySelector("[data-search-results] a")).not.toBeNull(),
    );
    expect(
      dialog
        .querySelector<HTMLAnchorElement>("[data-search-view-index]")
        ?.getAttribute("href"),
    ).toBe("/index/?q=compiler");

    dialog.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    expect(dialog.open).toBe(false);
    launcher.click();
    expect(dialog.open).toBe(true);
    expect(query.value).toBe("");
    expect(dialog.querySelector("[data-pinned-entry]")).not.toBeNull();
  });

  it("moves from query to results with arrows and activates the first result", async () => {
    const { dialog, launcher } = fixture();
    mountOverlay(dialog, async () => oneResult);
    launcher.click();
    const query = required<HTMLInputElement>(dialog, "[data-search-query]");
    query.value = "compiler";
    query.dispatchEvent(new Event("input", { bubbles: true }));
    await vi.waitFor(() =>
      expect(dialog.querySelector("[data-search-results] a")).not.toBeNull(),
    );
    const link = required<HTMLAnchorElement>(dialog, "[data-search-results] a");
    query.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    expect(document.activeElement).toBe(link);

    let activated = false;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      activated = true;
    });
    query.focus();
    query.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    expect(activated).toBe(true);
  });
});
