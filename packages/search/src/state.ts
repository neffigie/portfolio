export const SEARCH_TYPES = ["writing", "project"] as const;
export const SEARCH_SORTS = ["relevance", "newest", "oldest", "title"] as const;

export type SearchType = (typeof SEARCH_TYPES)[number];
export type SearchSort = (typeof SEARCH_SORTS)[number];

export interface SearchState {
  query: string;
  type: SearchType | null;
  tags: string[];
  sort: SearchSort;
}

export interface SearchStateInput {
  query?: unknown;
  type?: unknown;
  tags?: readonly unknown[];
  sort?: unknown;
}

function isSearchType(value: unknown): value is SearchType {
  return (
    typeof value === "string" && SEARCH_TYPES.includes(value as SearchType)
  );
}

function isSearchSort(value: unknown): value is SearchSort {
  return (
    typeof value === "string" && SEARCH_SORTS.includes(value as SearchSort)
  );
}

function normalizeTags(values: readonly unknown[] | undefined): string[] {
  const tags: string[] = [];
  const seen = new Set<string>();

  for (const value of values ?? []) {
    if (typeof value !== "string") continue;

    const tag = value.trim();
    const identity = tag.toLocaleLowerCase();
    if (!tag || seen.has(identity)) continue;

    seen.add(identity);
    tags.push(tag);
  }

  return tags;
}

export function normalizeSearchState(input: SearchStateInput): SearchState {
  const query = typeof input.query === "string" ? input.query.trim() : "";
  const requestedSort = isSearchSort(input.sort) ? input.sort : undefined;
  const defaultSort: SearchSort = query ? "relevance" : "newest";
  const sort =
    !query && requestedSort === "relevance"
      ? "newest"
      : (requestedSort ?? defaultSort);

  return {
    query,
    type: isSearchType(input.type) ? input.type : null,
    tags: normalizeTags(input.tags),
    sort,
  };
}

export function parseSearchParams(params: URLSearchParams): SearchState {
  return normalizeSearchState({
    query: params.get("q"),
    type: params.get("type"),
    tags: params.getAll("tag"),
    sort: params.get("sort"),
  });
}

export function serializeSearchParams(
  input: SearchStateInput,
): URLSearchParams {
  const state = normalizeSearchState(input);
  const params = new URLSearchParams();

  if (state.query) params.set("q", state.query);
  if (state.type) params.set("type", state.type);
  for (const tag of state.tags) params.append("tag", tag);

  const defaultSort: SearchSort = state.query ? "relevance" : "newest";
  if (state.sort !== defaultSort) params.set("sort", state.sort);

  return params;
}

export function stateToIndexUrl(input: SearchStateInput): string {
  const query = serializeSearchParams(input).toString();
  return query ? `/index/?${query}` : "/index/";
}
