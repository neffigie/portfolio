import { requiredElement } from "./dom.js";
import { normalizeSearchState, type SearchState } from "./state.js";
import { SearchResultsView } from "./view.js";

export class OverlaySearchView extends SearchResultsView {
  readonly form: HTMLFormElement;
  readonly query: HTMLInputElement;

  constructor(root: HTMLElement) {
    super(root);
    this.form = requiredElement(root, "[data-search-filters]", "search");
    this.query = requiredElement(root, "[data-search-query]", "search");
  }

  readState(): SearchState {
    return normalizeSearchState({ query: this.query.value });
  }

  renderFilters(state: SearchState): void {
    if (this.query.value.trim() !== state.query) this.query.value = state.query;
  }
}
