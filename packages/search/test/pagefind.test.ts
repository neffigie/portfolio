// @vitest-environment happy-dom

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
            pinOrder: index === 10 ? "2" : undefined,
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

  it("paginates the pinned-first default result order", async () => {
    const client = clientWithResults(25);

    const response = await searchEntries(client, {}, { offset: 10, limit: 5 });

    expect(response.total).toBe(25);
    expect(response.hasMore).toBe(true);
    expect(response.results.map((result) => result.url)).toEqual([
      "/entry-9/",
      "/entry-11/",
      "/entry-12/",
      "/entry-13/",
      "/entry-14/",
    ]);
    expect(response.results[0]).toEqual({
      url: "/entry-9/",
      title: "Entry 9",
      supportingText: "Opening preview 9",
      type: "project",
      date: "2026-09-20",
      tags: ["AWS", "Hugo"],
      pinOrder: null,
    });
  });

  it("orders an empty newest view by pin order before unpinned recency", async () => {
    const client: PagefindClient = {
      search: vi.fn(async () => ({
        results: [
          {
            id: "newest",
            data: async () => ({
              url: "/newest/",
              meta: { title: "Newest", date: "2026-11-01" },
            }),
          },
          {
            id: "pin-two",
            data: async () => ({
              url: "/pin-two/",
              meta: { title: "Pin two", date: "2026-01-01", pinOrder: "2" },
            }),
          },
          {
            id: "pin-one",
            data: async () => ({
              url: "/pin-one/",
              meta: { title: "Pin one", date: "2025-01-01", pinOrder: "1" },
            }),
          },
        ],
      })),
    };

    const response = await searchEntries(client, {});

    expect(response.results.map(({ url }) => url)).toEqual([
      "/pin-one/",
      "/pin-two/",
      "/newest/",
    ]);
  });

  it("preserves Pagefind relevance order when a query is present", async () => {
    const client: PagefindClient = {
      search: vi.fn(async () => ({
        results: [
          {
            id: "relevant",
            data: async () => ({
              url: "/relevant/",
              meta: { title: "Relevant" },
            }),
          },
          {
            id: "pinned",
            data: async () => ({
              url: "/pinned/",
              meta: { title: "Pinned", pinOrder: "1" },
            }),
          },
        ],
      })),
    };

    const response = await searchEntries(client, { query: "match" });

    expect(response.results.map(({ url }) => url)).toEqual([
      "/relevant/",
      "/pinned/",
    ]);
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

  it("decodes Pagefind entities before presenting a body passage as text", async () => {
    const client: PagefindClient = {
      search: vi.fn(async () => ({
        results: [
          {
            id: "entity",
            data: async () => ({
              url: "/entity/",
              excerpt: "Use <mark>C&amp;C</mark> &lt;code&gt;",
              plain_excerpt: "Use C&amp;C &lt;code&gt;",
              meta: {
                title: "Entity example",
                preview: "Opening &amp; literal.",
              },
            }),
          },
        ],
      })),
    };

    const response = await searchEntries(client, { query: "C&C" });
    expect(response.results[0]?.supportingText).toBe("Use C&C <code>");
  });
});
