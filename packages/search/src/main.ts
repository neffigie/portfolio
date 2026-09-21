import { mountIndexPage } from "./index-page.js";
import { mountOverlay } from "./overlay.js";
import {
  loadPagefindClient,
  type PagefindClient,
  searchEntries,
} from "./pagefind.js";
import type { SearchState } from "./state.js";

let clientPromise: Promise<PagefindClient> | undefined;

function search(
  state: SearchState,
  page?: { offset?: number; limit?: number },
) {
  clientPromise ??= loadPagefindClient().catch((error: unknown) => {
    clientPromise = undefined;
    throw error;
  });
  return clientPromise.then((client) => searchEntries(client, state, page));
}

function mount(): void {
  const dialog = document.querySelector<HTMLDialogElement>(
    "[data-search-dialog]",
  );
  if (dialog) mountOverlay(dialog, search);

  const index = document.querySelector<HTMLElement>("[data-index-root]");
  if (index) mountIndexPage(index, search);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount, { once: true });
} else {
  mount();
}
