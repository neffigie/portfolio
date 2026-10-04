import { requiredElement } from "./dom.js";
import { normalizeSearchState } from "./state.js";

export class TagPicker {
  readonly root: HTMLElement;
  private readonly filter: HTMLInputElement;
  private readonly options: HTMLInputElement[];
  private readonly pills: HTMLElement;
  private readonly empty: HTMLElement;
  private selected: string[];

  constructor(root: HTMLElement) {
    this.root = root;
    this.filter = requiredElement(root, "[data-tag-filter]", "tag picker");
    this.options = [
      ...root.querySelectorAll<HTMLInputElement>("[data-tag-option]"),
    ];
    this.pills = requiredElement(root, "[data-tag-pills]", "tag picker");
    this.empty = requiredElement(root, "[data-tag-empty]", "tag picker");
    this.selected = normalizeSearchState({
      tags: this.options
        .filter((option) => option.checked)
        .map((option) => option.value),
    }).tags;

    this.filter.addEventListener("input", () => this.filterOptions());
    root.addEventListener("change", (event) => {
      const option = event.target;
      if (
        !(option instanceof HTMLInputElement) ||
        !option.matches("[data-tag-option]")
      )
        return;
      const tags = option.checked
        ? [...this.selected, option.value]
        : this.selected.filter(
            (tag) =>
              tag.toLocaleLowerCase() !== option.value.toLocaleLowerCase(),
          );
      this.render(tags);
      this.notify();
    });
    this.pills.addEventListener("click", (event) => {
      const button =
        event.target instanceof HTMLElement
          ? event.target.closest<HTMLButtonElement>("[data-remove-tag]")
          : null;
      if (!button) return;
      const removed = button.dataset.removeTag?.toLocaleLowerCase();
      this.render(
        this.selected.filter((tag) => tag.toLocaleLowerCase() !== removed),
      );
      this.notify();
    });

    this.sync();
    this.filterOptions();
  }

  values(): string[] {
    return [...this.selected];
  }

  render(tags: readonly string[]): void {
    this.selected = normalizeSearchState({ tags }).tags;
    this.sync();
  }

  resetDisclosure(): void {
    this.filter.value = "";
    this.filterOptions();
    const disclosure = this.root.querySelector<HTMLDetailsElement>("details");
    if (disclosure) disclosure.open = false;
  }

  private notify(): void {
    this.root.dispatchEvent(new Event("search:tags-change", { bubbles: true }));
  }

  private sync(): void {
    const selectedKeys = new Set(
      this.selected.map((tag) => tag.toLocaleLowerCase()),
    );
    for (const option of this.options) {
      option.checked = selectedKeys.has(option.value.toLocaleLowerCase());
    }
    const buttons = this.selected.map((tag) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tag-pill";
      button.dataset.removeTag = tag;
      button.setAttribute("aria-label", `Remove ${tag} tag`);
      button.textContent = `${tag} ×`;
      return button;
    });
    this.pills.replaceChildren(...buttons);
    this.pills.scrollLeft = this.pills.scrollWidth;
  }

  private filterOptions(): void {
    const query = this.filter.value.trim().toLocaleLowerCase();
    let visible = 0;
    for (const option of this.options) {
      const label = option.closest("label");
      if (!label) continue;
      label.hidden = !option.value.toLocaleLowerCase().includes(query);
      if (!label.hidden) visible += 1;
    }
    this.empty.hidden = visible > 0;
  }
}
