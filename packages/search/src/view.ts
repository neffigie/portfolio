import { requiredElement } from "./dom.js";
import type { SearchResponse } from "./pagefind.js";
import { renderResultRow } from "./results.js";
import {
  normalizeSearchState,
  type SearchState,
  type SearchStateInput,
} from "./state.js";
import { TagPicker } from "./tags.js";

export class SearchResultsView {
  readonly root: HTMLElement;
  readonly results: HTMLUListElement;
  readonly status: HTMLElement;
  readonly more: HTMLButtonElement | null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.results = requiredElement(root, "[data-search-results]", "search");
    this.status = requiredElement(root, "[data-search-status]", "search");
    this.more = root.querySelector("[data-search-more]");
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

export class DomSearchView extends SearchResultsView {
  readonly form: HTMLFormElement;
  readonly query: HTMLInputElement;
  readonly type: HTMLSelectElement;
  readonly tags: TagPicker;
  readonly sort: HTMLSelectElement;
  private sortExplicit = false;

  constructor(root: HTMLElement) {
    super(root);
    this.form = requiredElement(root, "[data-search-filters]", "search");
    this.query = requiredElement(root, "[data-search-query]", "search");
    this.type = requiredElement(root, "[data-search-type]", "search");
    this.tags = new TagPicker(
      requiredElement(root, "[data-tag-picker]", "search"),
    );
    this.sort = requiredElement(root, "[data-search-sort]", "search");
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
      tags: this.tags.values(),
    };
    if (this.sortExplicit) input.sort = this.sort.value;
    return normalizeSearchState(input);
  }

  renderFilters(state: SearchState): void {
    if (this.query.value.trim() !== state.query) this.query.value = state.query;
    this.type.value = state.type ?? "";

    this.tags.render(state.tags);

    this.sort.value = state.sort;
    const defaultSort = state.query ? "relevance" : "newest";
    if (state.sort !== defaultSort) this.sortExplicit = true;
  }
}
