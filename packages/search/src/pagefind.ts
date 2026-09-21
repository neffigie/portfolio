import { normalizeSearchState, type SearchStateInput } from "./state.js";

export interface PagefindResultData {
  url: string;
  plain_excerpt?: string;
  meta: Record<string, string | undefined>;
}

export interface PagefindHit {
  id: string;
  data(): Promise<PagefindResultData>;
}

export interface PagefindClient {
  search(
    query: string | null,
    options: {
      filters?: { type?: string; tag?: string[] };
      sort?: { date?: "asc" | "desc"; title?: "asc" };
    },
  ): Promise<{ results: PagefindHit[] }>;
}

export interface SearchResult {
  url: string;
  title: string;
  summary: string;
  excerpt: string;
  type: "writing" | "project";
  date: string;
  tags: string[];
}

export interface SearchResponse {
  total: number;
  results: SearchResult[];
  hasMore: boolean;
}

export interface SearchPage {
  offset?: number;
  limit?: number;
}

export async function loadPagefindClient(): Promise<PagefindClient> {
  const path = "/pagefind/pagefind.js";
  return (await import(path)) as PagefindClient;
}

function parseTags(value: string | undefined): string[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((tag): tag is string => typeof tag === "string")
      : [];
  } catch {
    return [];
  }
}

function toSearchResult(data: PagefindResultData): SearchResult {
  return {
    url: data.url,
    title: data.meta.title ?? "Untitled",
    summary: data.meta.summary ?? "",
    excerpt: data.plain_excerpt ?? "",
    type: data.meta.type === "writing" ? "writing" : "project",
    date: data.meta.date ?? "",
    tags: parseTags(data.meta.tags),
  };
}

export async function searchEntries(
  client: PagefindClient,
  input: SearchStateInput,
  page: SearchPage = {},
): Promise<SearchResponse> {
  const state = normalizeSearchState(input);
  const filters: { type?: string; tag?: string[] } = {};

  if (state.type) filters.type = state.type;
  if (state.tags.length > 0) filters.tag = state.tags;

  const options: Parameters<PagefindClient["search"]>[1] = {};
  if (Object.keys(filters).length > 0) options.filters = filters;

  if (state.sort === "newest") options.sort = { date: "desc" };
  if (state.sort === "oldest") options.sort = { date: "asc" };
  if (state.sort === "title") options.sort = { title: "asc" };

  const response = await client.search(state.query || null, options);
  const offset = Math.max(0, page.offset ?? 0);
  const limit = Math.max(1, page.limit ?? 20);
  const batch = response.results.slice(offset, offset + limit);
  const results = await Promise.all(
    batch.map(async (result) => toSearchResult(await result.data())),
  );

  return {
    total: response.results.length,
    results,
    hasMore: offset + results.length < response.results.length,
  };
}
