import {
  SearchController,
  type SearchControllerOptions,
} from "./controller.js";
import { OverlaySearchView } from "./overlay-view.js";
import { normalizeSearchState } from "./state.js";

function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    target.closest(
      'input, textarea, select, [contenteditable="true"], [contenteditable=""]',
    ) !== null
  );
}

export function mountOverlay(
  dialog: HTMLDialogElement,
  search: SearchControllerOptions["search"],
): void {
  const view = new OverlaySearchView(dialog);
  const controller = new SearchController({ mode: "overlay", search, view });
  let invoker: HTMLElement | null = null;

  function update(): void {
    const state = view.readState();
    void controller.run(state);
  }

  function open(source: HTMLElement): void {
    if (dialog.open) return;
    invoker = source;
    view.renderFilters(normalizeSearchState({}));
    dialog.showModal();
    view.query.focus();
    update();
  }

  for (const launcher of document.querySelectorAll<HTMLElement>(
    "[data-search-open]",
  )) {
    launcher.addEventListener("click", () => open(launcher));
  }

  document.addEventListener("keydown", (event) => {
    if (
      event.key.toLowerCase() !== "k" ||
      (!event.ctrlKey && !event.metaKey) ||
      isEditable(event.target)
    ) {
      return;
    }
    event.preventDefault();
    const fallback = document.querySelector<HTMLElement>("[data-search-open]");
    if (fallback) open(fallback);
  });

  dialog.addEventListener("close", () => {
    const fallback = document.querySelector<HTMLElement>("[data-search-open]");
    const target = invoker?.isConnected ? invoker : fallback;
    target?.focus();
  });

  dialog.querySelector("[data-search-close]")?.addEventListener("click", () => {
    dialog.close();
  });

  view.form.addEventListener("submit", (event) => event.preventDefault());
  view.form.addEventListener("input", (event) => {
    if (event.target !== view.query) return;
    update();
  });
  view.more?.addEventListener("click", () => void controller.loadMore());

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      dialog.close();
      return;
    }

    const links = [...view.results.querySelectorAll<HTMLAnchorElement>("a")];
    if (links.length === 0) return;

    if (event.key === "Enter" && event.target === view.query) {
      event.preventDefault();
      links[0]?.click();
      return;
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.target !== view.query && current < 0) return;
    event.preventDefault();

    if (event.key === "ArrowUp" && current <= 0) {
      view.query.focus();
      return;
    }

    const next = event.key === "ArrowDown" ? current + 1 : current - 1;
    links[Math.min(next, links.length - 1)]?.focus();
  });
}
