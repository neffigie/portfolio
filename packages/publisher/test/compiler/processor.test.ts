import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  type CompilationContext,
  type ContentPlugin,
  compileDocument,
  DiagnosticCollector,
  type MediaRequestCollector,
} from "../../src/index.js";

function context(): CompilationContext {
  const media: MediaRequestCollector = {
    requestIds: () => [],
  };

  return {
    recordId: "entry-1",
    route: "/entry-1",
    siteOrigin: "https://neffigie.dev",
    diagnostics: new DiagnosticCollector(),
    media,
  };
}

function plugin(
  name: string,
  after: readonly string[],
  calls: string[],
): ContentPlugin {
  return {
    name,
    after,
    transform() {
      calls.push(name);
    },
  };
}

describe("compileDocument", () => {
  it("orders plugins by declared predecessors and returns semantic output", async () => {
    const calls: string[] = [];
    const plugins = [
      plugin("second", ["first"], calls),
      plugin("first", [], calls),
    ];

    const result = await compileDocument(
      "<p>Hello <mark>world</mark></p>",
      context(),
      plugins,
    );

    expect(calls).toEqual(["first", "second"]);
    expect(result.html).toBe("<p>Hello <mark>world</mark></p>");
    expect(result.searchableText).toBe("Hello world");
    expect(result.mediaRequestIds).toEqual([]);
  });

  it("preserves registration order for independent plugins", async () => {
    const calls: string[] = [];

    await compileDocument("<p>Text</p>", context(), [
      plugin("third", [], calls),
      plugin("first", [], calls),
    ]);

    expect(calls).toEqual(["third", "first"]);
  });

  it("rejects duplicate plugin names", async () => {
    await expect(
      compileDocument("<p>Text</p>", context(), [
        plugin("same", [], []),
        plugin("same", [], []),
      ]),
    ).rejects.toThrow(/duplicate.*same/iu);
  });

  it("rejects an ordering cycle", async () => {
    await expect(
      compileDocument("<p>Text</p>", context(), [
        plugin("first", ["second"], []),
        plugin("second", ["first"], []),
      ]),
    ).rejects.toThrow(/cycle/iu);
  });

  it("rejects a missing declared predecessor", async () => {
    await expect(
      compileDocument("<p>Text</p>", context(), [
        plugin("second", ["not-registered"], []),
      ]),
    ).rejects.toThrow(/not-registered/iu);
  });

  it("awaits asynchronous transforms before later plugins", async () => {
    const calls: string[] = [];
    const first: ContentPlugin = {
      name: "first",
      async transform() {
        await Promise.resolve();
        calls.push("first");
      },
    };

    await compileDocument("<p>Text</p>", context(), [
      plugin("second", ["first"], calls),
      first,
    ]);

    expect(calls).toEqual(["first", "second"]);
  });

  it("preserves unknown valid elements, attributes, and meaningful children", async () => {
    const source = await readFile(
      new URL(
        "../../../../fixtures/v1/source/passthrough.html",
        import.meta.url,
      ),
      "utf8",
    );
    const expected = await readFile(
      new URL(
        "../../../../fixtures/v1/expected/passthrough.html",
        import.meta.url,
      ),
      "utf8",
    );

    const result = await compileDocument(source.trim(), context(), []);

    expect(`${result.html}\n`).toBe(expected);
    expect(result.searchableText).toBe("Why Because K remains meaningful.");
  });
});
