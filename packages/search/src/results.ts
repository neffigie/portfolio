import type { SearchResult } from "./pagefind.js";

function internalHref(url: string): string {
  return url.startsWith("/") && !url.startsWith("//") && !url.includes("\\")
    ? url
    : "/index/";
}

export function renderResultRow(result: SearchResult): HTMLLIElement {
  const row = document.createElement("li");
  row.className = "search-result";
  row.dataset.searchResult = "";

  const link = document.createElement("a");
  link.className = "search-result-link";
  link.href = internalHref(result.url);
  link.textContent = result.title;
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
  date.textContent = result.date;
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
