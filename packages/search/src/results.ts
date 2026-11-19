import type { SearchResult } from "./pagefind.js";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function displayDate(value: string): string {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp)
    ? value.toLocaleLowerCase()
    : dateFormat.format(timestamp).toLocaleLowerCase();
}

function internalHref(url: string): string {
  return url.startsWith("/") && !url.startsWith("//") && !url.includes("\\")
    ? url
    : "/posts/";
}

function pinIcon(): HTMLSpanElement {
  const pin = document.createElement("span");
  pin.className = "pin-icon";
  pin.setAttribute("aria-hidden", "true");
  pin.innerHTML =
    '<svg viewBox="0 0 24 22" focusable="false"><path d="M16 8V4h1V2H7v2h1v4c0 1.66-1.34 3-3 3v2h6v6l1 2 1-2v-6h6v-2c-1.66 0-3-1.34-3-3Z"/></svg>';
  return pin;
}

export function renderResultRow(result: SearchResult): HTMLLIElement {
  const row = document.createElement("li");
  row.className = "search-result";
  row.dataset.searchResult = "";

  const link = document.createElement("a");
  link.className = "search-result-link";
  link.href = internalHref(result.url);
  if (result.pinOrder !== null) link.append(pinIcon());
  const title = document.createElement("span");
  title.className = "search-result-title";
  title.textContent = result.title;
  link.append(title);
  row.append(link);

  if (result.supportingText) {
    const preview = document.createElement("p");
    preview.className = "search-result-preview";
    preview.dataset.resultPreview = "";
    preview.textContent = result.supportingText;
    row.append(preview);
  }

  const metadata = document.createElement("div");
  metadata.className = "search-result-meta";

  const type = document.createElement("span");
  type.textContent = result.type;
  metadata.append(type);

  const date = document.createElement("time");
  date.dateTime = result.date;
  date.textContent = displayDate(result.date);
  metadata.append(date);

  for (const label of result.tags) {
    const tag = document.createElement("span");
    tag.dataset.resultTag = "";
    tag.textContent = label;
    metadata.append(tag);
  }

  row.append(metadata);
  return row;
}
