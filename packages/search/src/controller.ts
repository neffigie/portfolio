import type { SearchResponse } from "./pagefind.js";
import {
  normalizeSearchState,
  type SearchState,
  type SearchStateInput,
} from "./state.js";

export interface SearchView {
  renderLoading(): void;
  renderResults(response: SearchResponse): void;
  renderPins(): void;
  renderEmpty(): void;
  renderError(message: string): void;
  renderFilters(state: SearchState): void;
  announce(message: string): void;
}

export interface SearchControllerOptions {
  mode: "index" | "overlay";
  view: SearchView;
  search(state: SearchState): Promise<SearchResponse>;
}

export class SearchController {
  private requestId = 0;
  private readonly mode: "index" | "overlay";
  private readonly view: SearchView;
  private readonly search: SearchControllerOptions["search"];

  constructor(options: SearchControllerOptions) {
    this.mode = options.mode;
    this.view = options.view;
    this.search = options.search;
  }

  async run(input: SearchStateInput): Promise<void> {
    const requestId = ++this.requestId;
    const state = normalizeSearchState(input);
    this.view.renderFilters(state);

    if (
      this.mode === "overlay" &&
      !state.query &&
      !state.type &&
      state.tags.length === 0
    ) {
      this.view.renderPins();
      this.view.announce("Pinned entries");
      return;
    }

    this.view.renderLoading();

    try {
      const response = await this.search(state);
      if (requestId !== this.requestId) return;

      if (response.total === 0) {
        this.view.renderEmpty();
        this.view.announce("No results");
        return;
      }

      this.view.renderResults(response);
      this.view.announce(
        `${response.total} ${response.total === 1 ? "result" : "results"}`,
      );
    } catch {
      if (requestId !== this.requestId) return;
      const message = "Search is unavailable. Please try again.";
      this.view.renderError(message);
      this.view.announce(message);
    }
  }
}
