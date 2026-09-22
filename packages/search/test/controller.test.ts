import { describe, expect, it } from "vitest";

import { SearchController, type SearchView } from "../src/controller.js";
import type { SearchResponse } from "../src/pagefind.js";
import type { SearchState } from "../src/state.js";

const oneResult: SearchResponse = {
  total: 1,
  hasMore: false,
  results: [
    {
      url: "/project-one/",
      title: "Publication Compiler",
      supportingText: "A durable pipeline.",
      type: "project",
      date: "2026-09-20",
      tags: ["AWS"],
    },
  ],
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function recordingView() {
  const events: string[] = [];
  const view: SearchView = {
    renderLoading: () => events.push("loading"),
    renderResults: (response, append) =>
      events.push(
        `${append ? "append" : "results"}:${response.results.map((item) => item.title)}`,
      ),
    renderPins: () => events.push("pins"),
    renderEmpty: () => events.push("empty"),
    renderError: (message) => events.push(`error:${message}`),
    renderFilters: (state) => events.push(`filters:${state.sort}`),
    announce: (message) => events.push(`announce:${message}`),
  };
  return { view, events };
}

describe("shared search controller", () => {
  it("shows pins without loading Pagefind for an empty overlay", async () => {
    const { view, events } = recordingView();
    const states: SearchState[] = [];
    const controller = new SearchController({
      mode: "overlay",
      view,
      search: async (state) => {
        states.push(state);
        return oneResult;
      },
    });

    await controller.run({});

    expect(states).toEqual([]);
    expect(events).toContain("pins");
    expect(events).not.toContain("loading");
  });

  it("keeps pins for filter-only overlay state and queries when text is entered", async () => {
    const { view, events } = recordingView();
    const states: SearchState[] = [];
    const controller = new SearchController({
      mode: "overlay",
      view,
      search: async (state) => {
        states.push(state);
        return oneResult;
      },
    });

    await controller.run({ type: "project" });
    await controller.run({ tags: ["AWS"] });
    await controller.run({ query: "compiler", tags: ["AWS"] });

    expect(states).toHaveLength(1);
    expect(states[0]).toMatchObject({ query: "compiler", tags: ["AWS"] });
    expect(events.filter((event) => event === "pins")).toHaveLength(2);
    expect(events.filter((event) => event === "loading")).toHaveLength(1);
    expect(events).toContain("results:Publication Compiler");
  });

  it("queries the newest unfiltered corpus by default on the index", async () => {
    const { view, events } = recordingView();
    const states: SearchState[] = [];
    const controller = new SearchController({
      mode: "index",
      view,
      search: async (state) => {
        states.push(state);
        return oneResult;
      },
    });

    await controller.run({});

    expect(states[0]).toEqual({
      query: "",
      type: null,
      tags: [],
      sort: "newest",
    });
    expect(events).toContain("results:Publication Compiler");
    expect(events).toContain("announce:1 result");
  });

  it("discards stale asynchronous results", async () => {
    const { view, events } = recordingView();
    const first = deferred<SearchResponse>();
    const second = deferred<SearchResponse>();
    let calls = 0;
    const controller = new SearchController({
      mode: "index",
      view,
      search: () => {
        calls += 1;
        return calls === 1 ? first.promise : second.promise;
      },
    });

    const older = controller.run({ query: "older" });
    const newer = controller.run({ query: "newer" });
    second.resolve(oneResult);
    await newer;
    first.resolve({ total: 0, hasMore: false, results: [] });
    await older;

    expect(events.filter((event) => event === "empty")).toHaveLength(0);
    expect(events.filter((event) => event.startsWith("results:"))).toEqual([
      "results:Publication Compiler",
    ]);
  });

  it("renders a useful error and live announcement after failure", async () => {
    const { view, events } = recordingView();
    const controller = new SearchController({
      mode: "index",
      view,
      search: async () => {
        throw new Error("offline");
      },
    });

    await controller.run({ query: "compiler" });

    expect(events).toContain("error:Search is unavailable. Please try again.");
    expect(events).toContain(
      "announce:Search is unavailable. Please try again.",
    );
  });

  it("loads later batches without replacing earlier results", async () => {
    const { view, events } = recordingView();
    const offsets: number[] = [];
    const firstResult = oneResult.results.at(0);
    if (!firstResult) throw new Error("Missing result fixture");
    const controller = new SearchController({
      mode: "index",
      view,
      search: async (_state, page) => {
        offsets.push(page?.offset ?? 0);
        return {
          total: 2,
          hasMore: offsets.length === 1,
          results: [
            {
              ...firstResult,
              title: offsets.length === 1 ? "First" : "Second",
            },
          ],
        };
      },
    });

    await controller.run({});
    await controller.loadMore();
    await controller.loadMore();

    expect(offsets).toEqual([0, 1]);
    expect(events).toContain("results:First");
    expect(events).toContain("append:Second");
  });
});
