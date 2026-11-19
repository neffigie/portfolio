import { requiredElement } from "./dom.js";
import { normalizeSearchState } from "./state.js";

export class TagPicker {
  readonly root: HTMLElement;
  private readonly options: HTMLInputElement[];
  private readonly pills: HTMLElement;
  private selected: string[];

  constructor(root: HTMLElement) {
    this.root = root;
    this.options = [
      ...root.querySelectorAll<HTMLInputElement>("[data-tag-option]"),
    ];
    this.pills = requiredElement(root, "[data-tag-pills]", "tag picker");
    this.selected = normalizeSearchState({
      tags: this.options
        .filter((option) => option.checked)
        .map((option) => option.value),
    }).tags;

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
  }

  values(): string[] {
    return [...this.selected];
  }

  render(tags: readonly string[]): void {
    const labels = new Map(
      this.options.map((option) => [
        option.value.toLocaleLowerCase(),
        option.value,
      ]),
    );
    this.selected = normalizeSearchState({ tags }).tags.map(
      (tag) => labels.get(tag.toLocaleLowerCase()) ?? tag,
    );
    this.sync();
  }

  resetDisclosure(): void {
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
      button.setAttribute("aria-label", `remove ${tag} tag`);
      button.textContent = `${tag} ×`;
      return button;
    });
    this.pills.replaceChildren(...buttons);
    this.pills.scrollLeft = this.pills.scrollWidth;
  }
}
