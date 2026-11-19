import { requiredElement } from "./dom.js";

export class FilterSelect {
  private readonly details: HTMLDetailsElement;
  private readonly label: HTMLElement;
  private readonly options: HTMLButtonElement[];
  private readonly summary: HTMLElement;

  constructor(
    private readonly root: HTMLElement,
    private readonly select: HTMLSelectElement,
  ) {
    this.details = requiredElement(root, "details", "filter select");
    this.summary = requiredElement(root, "summary", "filter select");
    this.label = requiredElement(
      root,
      "[data-filter-select-label]",
      "filter select",
    );
    this.options = [
      ...root.querySelectorAll<HTMLButtonElement>(
        "[data-filter-select-option]",
      ),
    ];

    root.addEventListener("click", (event) => {
      const option =
        event.target instanceof HTMLElement
          ? event.target.closest<HTMLButtonElement>(
              "[data-filter-select-option]",
            )
          : null;
      if (!option) return;
      this.select.value = option.dataset.value ?? "";
      this.sync();
      this.details.open = false;
      this.select.dispatchEvent(new Event("change", { bubbles: true }));
      this.summary.focus();
    });
    this.select.addEventListener("change", () => this.sync());
    this.sync();
  }

  sync(): void {
    const selected = this.select.selectedOptions[0];
    const text = selected?.textContent?.trim() ?? "";
    this.label.textContent = text;
    this.summary.setAttribute(
      "aria-label",
      `${this.root.dataset.filterSelect ?? "filter"}, ${text}`,
    );
    for (const option of this.options) {
      option.setAttribute(
        "aria-pressed",
        String((option.dataset.value ?? "") === this.select.value),
      );
    }
  }
}
