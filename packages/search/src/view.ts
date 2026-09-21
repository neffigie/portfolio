import type { SearchResponse } from "./pagefind.js";
import { renderResultRow } from "./results.js";
import {
  normalizeSearchState,
  type SearchState,
  type SearchStateInput,
} from "./state.js";

function required<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing search element: ${selector}`);
  return element;
}

export class DomSearchView {
  readonly root: HTMLElement;
  readonly form: HTMLFormElement;
  readonly query: HTMLInputElement;
  readonly type: HTMLSelectElement;
  readonly tag: HTMLInputElement;
  readonly sort: HTMLSelectElement;
  readonly results: HTMLUListElement;
  readonly status: HTMLElement;
  readonly more: HTMLButtonElement | null;
  private sortExplicit = false;

  constructor(root: HTMLElement) {
    this.root = root;
    this.form = required(root, "[data-search-filters]");
    this.query = required(root, "[data-search-query]");
    this.type = required(root, "[data-search-type]");
    this.tag = required(root, "[data-search-tag]");
    this.sort = required(root, "[data-search-sort]");
    this.results = required(root, "[data-search-results]");
    this.status = required(root, "[data-search-status]");
    this.more = root.querySelector("[data-search-more]");
  }

  markSortExplicit(): void {
    this.sortExplicit = true;
  }

  setSortExplicit(value: boolean): void {
    this.sortExplicit = value;
  }

  readState(): SearchState {
    const input: SearchStateInput = {
      query: this.query.value,
      type: this.type.value,
      tags: this.tag.value.split(","),
    };
    if (this.sortExplicit) input.sort = this.sort.value;
    return normalizeSearchState(input);
  }

  renderFilters(state: SearchState): void {
    if (this.query.value.trim() !== state.query) this.query.value = state.query;
    this.type.value = state.type ?? "";

    const currentTags = normalizeSearchState({
      tags: this.tag.value.split(","),
    }).tags;
    if (currentTags.join("\0") !== state.tags.join("\0")) {
      this.tag.value = state.tags.join(", ");
    }

    this.sort.value = state.sort;
    const defaultSort = state.query ? "relevance" : "newest";
    if (state.sort !== defaultSort) this.sortExplicit = true;
  }

  renderLoading(): void {
    this.root.setAttribute("aria-busy", "true");
    this.status.textContent = "Searching…";
  }

  renderResults(response: SearchResponse, append = false): void {
    this.root.removeAttribute("aria-busy");
    const rows = response.results.map(renderResultRow);
    if (append) this.results.append(...rows);
    else this.results.replaceChildren(...rows);
    if (this.more) this.more.hidden = !response.hasMore;
  }

  renderPins(): void {
    this.root.removeAttribute("aria-busy");
    const pins =
      this.root.querySelector<HTMLTemplateElement>("[data-search-pins]");
    this.results.replaceChildren(pins?.content.cloneNode(true) ?? "");
    if (this.more) this.more.hidden = true;
  }

  renderEmpty(): void {
    this.root.removeAttribute("aria-busy");
    this.results.replaceChildren();
    if (this.more) this.more.hidden = true;
  }

  renderError(_message: string): void {
    this.root.removeAttribute("aria-busy");
    this.results.replaceChildren();
    if (this.more) this.more.hidden = true;
  }

  announce(message: string): void {
    this.status.textContent = message;
  }
}
