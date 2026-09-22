import { normalizeSearchState, type SearchState } from "./state.js";
import { requiredSearchElement, SearchResultsView } from "./view.js";

export class OverlaySearchView extends SearchResultsView {
  readonly form: HTMLFormElement;
  readonly query: HTMLInputElement;

  constructor(root: HTMLElement) {
    super(root);
    this.form = requiredSearchElement(root, "[data-search-filters]");
    this.query = requiredSearchElement(root, "[data-search-query]");
  }

  readState(): SearchState {
    return normalizeSearchState({ query: this.query.value });
  }

  renderFilters(state: SearchState): void {
    if (this.query.value.trim() !== state.query) this.query.value = state.query;
  }
}
