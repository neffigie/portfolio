import {
  SearchController,
  type SearchControllerOptions,
} from "./controller.js";
import { debounce } from "./dom.js";
import { parseSearchParams, stateToIndexUrl } from "./state.js";
import { DomSearchView } from "./view.js";

export function mountIndexPage(
  root: HTMLElement,
  search: SearchControllerOptions["search"],
): void {
  const view = new DomSearchView(root);
  const controller = new SearchController({ mode: "index", search, view });

  function restoreFromUrl(): void {
    const params = new URLSearchParams(window.location.search);
    view.setSortExplicit(params.has("sort"));
    view.renderFilters(parseSearchParams(params));
    void controller.run(view.readState());
  }

  function update(): void {
    typing.cancel();
    const state = view.readState();
    window.history.replaceState(
      window.history.state,
      "",
      stateToIndexUrl(state),
    );
    void controller.run(state);
  }

  // Typing waits for a pause; filter changes search at once and supersede it.
  const typing = debounce(update, 150);

  view.form.addEventListener("submit", (event) => event.preventDefault());
  view.form.addEventListener("input", (event) => {
    if (event.target !== view.query) return;
    typing();
  });
  view.form.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLSelectElement)) return;
    if (event.target === view.sort) view.markSortExplicit();
    update();
  });
  view.root.addEventListener("search:tags-change", update);
  view.more?.addEventListener("click", () => void controller.loadMore());
  window.addEventListener("popstate", restoreFromUrl);
  // Hugo already rendered the unfiltered list; only a shared URL needs a search.
  if (window.location.search) restoreFromUrl();
}
