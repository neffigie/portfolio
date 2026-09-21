import { describe, expect, it } from "vitest";

import {
  compileEntry,
  createContentPlugins,
  DiagnosticCollector,
  type MediaRequestCollector,
  type NormalizedEntry,
} from "../src/index.js";

const sourceRevisionFingerprint = "a".repeat(64);

const entry: NormalizedEntry = {
  sourceId: "entry-1",
  title: "A deliberate compiler",
  slug: "deliberate-compiler",
  route: "/deliberate-compiler",
  summary: "How the publishing boundary works.",
  bodyHtml: "<h2>Compiler boundary</h2><p>One durable artifact.</p>",
  type: "writing",
  tags: [{ key: "architecture", label: "Architecture" }],
  date: "2026-09-20T00:00:00.000Z",
  pinOrder: 1,
  asset: null,
  created: "2026-09-01T12:00:00.000Z",
  updated: "2026-09-20T12:00:00.000Z",
  classification: "published",
};

function noMedia(): MediaRequestCollector {
  return {
    request() {
      throw new Error("No media expected.");
    },
    async resolve() {
      throw new Error("No media expected.");
    },
    requestIds: () => [],
  };
}

describe("compileEntry", () => {
  it("compiles a published entry and fingerprints its rendered content", async () => {
    const compiled = await compileEntry(entry, {
      sourceRevisionFingerprint,
      siteOrigin: "https://neffigie.dev",
      diagnostics: new DiagnosticCollector(),
      media: noMedia(),
      plugins: createContentPlugins(new Set()),
    });

    expect(compiled).toMatchObject({
      sourceId: "entry-1",
      route: "/deliberate-compiler",
      searchableText: "Compiler boundary One durable artifact.",
      mediaHashes: [],
      sourceRevisionFingerprint,
    });
    expect(compiled.html).toContain('id="compiler-boundary"');
    expect(compiled.entryContentFingerprint).toMatch(/^[0-9a-f]{64}$/u);
  });

  it("changes the content fingerprint when rendered content changes", async () => {
    const dependencies = {
      sourceRevisionFingerprint,
      siteOrigin: "https://neffigie.dev",
      diagnostics: new DiagnosticCollector(),
      media: noMedia(),
      plugins: createContentPlugins(new Set()),
    };
    const first = await compileEntry(entry, dependencies);
    const second = await compileEntry(
      { ...entry, bodyHtml: "<p>A different body.</p>" },
      { ...dependencies, media: noMedia() },
    );

    expect(second.entryContentFingerprint).not.toBe(
      first.entryContentFingerprint,
    );
  });

  it("rejects entries outside the published contract", async () => {
    await expect(
      compileEntry(
        {
          ...entry,
          classification: "draft",
          route: null,
          type: null,
          date: null,
        },
        {
          sourceRevisionFingerprint,
          siteOrigin: "https://neffigie.dev",
          diagnostics: new DiagnosticCollector(),
          media: noMedia(),
          plugins: createContentPlugins(new Set()),
        },
      ),
    ).rejects.toThrow(/published entry/iu);
  });
});
