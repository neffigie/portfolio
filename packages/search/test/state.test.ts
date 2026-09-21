import { describe, expect, it } from "vitest";

import {
  normalizeSearchState,
  parseSearchParams,
  serializeSearchParams,
  stateToIndexUrl,
} from "../src/index.js";

describe("normalizeSearchState", () => {
  it("uses newest for an empty state", () => {
    expect(normalizeSearchState({})).toEqual({
      query: "",
      sort: "newest",
      tags: [],
      type: null,
    });
  });

  it("uses relevance for a nonempty query", () => {
    expect(normalizeSearchState({ query: "  static search  " }).sort).toBe(
      "relevance",
    );
  });

  it("preserves an explicit newest sort with a query", () => {
    expect(
      normalizeSearchState({ query: "static search", sort: "newest" }).sort,
    ).toBe("newest");
  });

  it("changes relevance to newest when there is no query", () => {
    expect(normalizeSearchState({ sort: "relevance" }).sort).toBe("newest");
  });

  it("trims tags and deduplicates them case-insensitively", () => {
    expect(
      normalizeSearchState({
        tags: ["  AWS ", "systems", "aws", "SYSTEMS", "TypeScript"],
      }).tags,
    ).toEqual(["AWS", "systems", "TypeScript"]);
  });

  it("drops invalid type and sort values", () => {
    expect(
      normalizeSearchState({ type: "essay", sort: "popular" }),
    ).toMatchObject({ type: null, sort: "newest" });
  });
});

describe("search URL state", () => {
  it("parses the public query parameter names", () => {
    const params = new URLSearchParams(
      "q=distributed+systems&type=writing&tag=AWS&tag=architecture&sort=oldest",
    );

    expect(parseSearchParams(params)).toEqual({
      query: "distributed systems",
      sort: "oldest",
      tags: ["AWS", "architecture"],
      type: "writing",
    });
  });

  it("omits contextual defaults when serializing", () => {
    expect(serializeSearchParams(normalizeSearchState({})).toString()).toBe("");
    expect(
      serializeSearchParams(
        normalizeSearchState({ query: "static search" }),
      ).toString(),
    ).toBe("q=static+search");
  });

  it("retains an explicit nondefault sort", () => {
    expect(
      serializeSearchParams(
        normalizeSearchState({ query: "static search", sort: "newest" }),
      ).toString(),
    ).toBe("q=static+search&sort=newest");
  });

  it("round-trips normalized Unicode state", () => {
    const state = normalizeSearchState({
      query: "café systems",
      sort: "title",
      tags: ["São Paulo", "C++"],
      type: "project",
    });

    expect(parseSearchParams(serializeSearchParams(state))).toEqual(state);
  });

  it("builds the canonical index URL", () => {
    expect(stateToIndexUrl({ query: "search", tags: ["systems", "AWS"] })).toBe(
      "/index/?q=search&tag=systems&tag=AWS",
    );
    expect(stateToIndexUrl({})).toBe("/index/");
  });
});
