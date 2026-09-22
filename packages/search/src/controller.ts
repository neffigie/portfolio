import type { SearchPage, SearchResponse } from "./pagefind.js";
import {
  normalizeSearchState,
  type SearchState,
  type SearchStateInput,
} from "./state.js";

export interface SearchView {
  renderLoading(): void;
  renderResults(response: SearchResponse, append?: boolean): void;
  renderPins(): void;
  renderEmpty(): void;
  renderError(message: string): void;
  renderFilters(state: SearchState): void;
  announce(message: string): void;
}

export interface SearchControllerOptions {
  mode: "index" | "overlay";
  view: SearchView;
  search(state: SearchState, page?: SearchPage): Promise<SearchResponse>;
}

export class SearchController {
  private requestId = 0;
  private readonly mode: "index" | "overlay";
  private readonly view: SearchView;
  private readonly search: SearchControllerOptions["search"];
  private state: SearchState | null = null;
  private nextOffset = 0;
  private hasMore = false;
  private loadingMore = false;

  constructor(options: SearchControllerOptions) {
    this.mode = options.mode;
    this.view = options.view;
    this.search = options.search;
  }

  async run(input: SearchStateInput): Promise<void> {
    const requestId = ++this.requestId;
    const state = normalizeSearchState(input);
    this.state = state;
    this.nextOffset = 0;
    this.hasMore = false;
    this.view.renderFilters(state);

    if (this.mode === "overlay" && !state.query) {
      this.view.renderPins();
      this.view.announce("Pinned entries");
      return;
    }

    this.view.renderLoading();

    try {
      const response = await this.search(state);
      if (requestId !== this.requestId) return;
      this.nextOffset = response.results.length;
      this.hasMore = response.hasMore;

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

  async loadMore(): Promise<void> {
    if (!this.state || !this.hasMore || this.loadingMore) return;

    const requestId = ++this.requestId;
    const state = this.state;
    this.loadingMore = true;
    this.view.renderLoading();

    try {
      const response = await this.search(state, { offset: this.nextOffset });
      if (requestId !== this.requestId) return;

      this.nextOffset += response.results.length;
      this.hasMore = response.hasMore;
      this.view.renderResults(response, true);
      this.view.announce(`${this.nextOffset} of ${response.total} results`);
    } catch {
      if (requestId !== this.requestId) return;
      const message = "Search is unavailable. Please try again.";
      this.view.renderError(message);
      this.view.announce(message);
    } finally {
      this.loadingMore = false;
    }
  }
}
