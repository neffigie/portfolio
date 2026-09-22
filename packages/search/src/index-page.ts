import {
  SearchController,
  type SearchControllerOptions,
} from "./controller.js";
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
    void controller.run(parseSearchParams(params));
  }

  function update(): void {
    const state = view.readState();
    window.history.replaceState(
      window.history.state,
      "",
      stateToIndexUrl(state),
    );
    void controller.run(state);
  }

  view.form.addEventListener("submit", (event) => event.preventDefault());
  view.form.addEventListener("input", (event) => {
    if (event.target !== view.query) return;
    update();
  });
  view.form.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLSelectElement)) return;
    if (event.target === view.sort) view.markSortExplicit();
    update();
  });
  view.root.addEventListener("search:tags-change", update);
  view.more?.addEventListener("click", () => void controller.loadMore());
  window.addEventListener("popstate", restoreFromUrl);
  restoreFromUrl();
}
