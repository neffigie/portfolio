import { describe, expect, it, vi } from "vitest";

import { type PagefindClient, searchEntries } from "../src/pagefind.js";

function clientWithResults(count = 0): PagefindClient {
  return {
    search: vi.fn(async () => ({
      results: Array.from({ length: count }, (_, index) => ({
        id: String(index),
        data: async () => ({
          url: `/entry-${index}/`,
          plain_excerpt: `Excerpt ${index}`,
          meta: {
            title: `Entry ${index}`,
            preview: `Opening preview ${index}`,
            type: "project",
            date: "2026-09-20",
            tags: '["AWS","Hugo"]',
          },
        }),
      })),
    })),
  };
}

describe("Pagefind search adapter", () => {
  it("passes query, type, and intersecting tags to Pagefind", async () => {
    const client = clientWithResults();

    await searchEntries(client, {
      query: "compiler",
      type: "project",
      tags: ["AWS", "Hugo"],
      sort: "relevance",
    });

    expect(client.search).toHaveBeenCalledWith("compiler", {
      filters: { type: "project", tag: ["AWS", "Hugo"] },
    });
  });

  it("uses null-query date descending for the unfiltered index", async () => {
    const client = clientWithResults();

    await searchEntries(client, {});

    expect(client.search).toHaveBeenCalledWith(null, {
      sort: { date: "desc" },
    });
  });

  it("supports date ascending and title ascending sorts", async () => {
    const client = clientWithResults();

    await searchEntries(client, { sort: "oldest" });
    expect(client.search).toHaveBeenLastCalledWith(null, {
      sort: { date: "asc" },
    });

    await searchEntries(client, { sort: "title" });
    expect(client.search).toHaveBeenLastCalledWith(null, {
      sort: { title: "asc" },
    });
  });

  it("loads only the requested result batch", async () => {
    const client = clientWithResults(25);

    const response = await searchEntries(client, {}, { offset: 10, limit: 5 });

    expect(response.total).toBe(25);
    expect(response.hasMore).toBe(true);
    expect(response.results.map((result) => result.url)).toEqual([
      "/entry-10/",
      "/entry-11/",
      "/entry-12/",
      "/entry-13/",
      "/entry-14/",
    ]);
    expect(response.results[0]).toEqual({
      url: "/entry-10/",
      title: "Entry 10",
      supportingText: "Opening preview 10",
      type: "project",
      date: "2026-09-20",
      tags: ["AWS", "Hugo"],
    });
  });

  it("uses a relevant body passage but falls back to opening prose for title-only matches", async () => {
    const client: PagefindClient = {
      search: vi.fn(async () => ({
        results: [
          {
            id: "body",
            data: async () => ({
              url: "/body/",
              excerpt: "Before <mark>canonical</mark> after",
              plain_excerpt: "Before canonical after",
              meta: { title: "Body result", preview: "Opening body." },
            }),
          },
          {
            id: "title",
            data: async () => ({
              url: "/title/",
              excerpt: "Unrelated passage",
              plain_excerpt: "Unrelated passage",
              meta: { title: "Canonical title", preview: "Opening title." },
            }),
          },
        ],
      })),
    };

    const response = await searchEntries(client, { query: "canonical" });
    expect(
      response.results.map(({ supportingText }) => supportingText),
    ).toEqual(["Before canonical after", "Opening title."]);
  });
});
