import { describe, expect, it } from "vitest";

import {
  compilePost,
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

describe("compilePost", () => {
  it("compiles a published entry and fingerprints its rendered content", async () => {
    const compiled = await compilePost(entry, {
      sourceRevisionFingerprint,
      siteOrigin: "https://www.neffigie.com",
      diagnostics: new DiagnosticCollector(),
      media: noMedia(),
      plugins: createContentPlugins(new Set()),
    });

    expect(compiled).toMatchObject({
      sourceId: "entry-1",
      kind: "writing",
      route: "/deliberate-compiler",
      searchableText: "Compiler boundary One durable artifact.",
      mediaHashes: [],
      sourceRevisionFingerprint,
    });
    expect(compiled.html).toContain('id="compiler-boundary"');
    expect(compiled.contentFingerprint).toMatch(/^[0-9a-f]{64}$/u);
  });

  it("changes the content fingerprint when rendered content changes", async () => {
    const dependencies = {
      sourceRevisionFingerprint,
      siteOrigin: "https://www.neffigie.com",
      diagnostics: new DiagnosticCollector(),
      media: noMedia(),
      plugins: createContentPlugins(new Set()),
    };
    const first = await compilePost(entry, dependencies);
    const second = await compilePost(
      { ...entry, bodyHtml: "<p>A different body.</p>" },
      { ...dependencies, media: noMedia() },
    );

    expect(second.contentFingerprint).not.toBe(first.contentFingerprint);
  });

  it("rejects entries outside the published contract", async () => {
    await expect(
      compilePost(
        {
          ...entry,
          classification: "draft",
          route: null,
          type: null,
          date: null,
        },
        {
          sourceRevisionFingerprint,
          siteOrigin: "https://www.neffigie.com",
          diagnostics: new DiagnosticCollector(),
          media: noMedia(),
          plugins: createContentPlugins(new Set()),
        },
      ),
    ).rejects.toThrow(/as a post/iu);
  });

  it("compiles a special post as its slug's kind regardless of type", async () => {
    const compiled = await compilePost(
      {
        ...entry,
        slug: "resume",
        route: "/resume",
        classification: "reserved",
        bodyHtml: "",
        pinOrder: null,
      },
      {
        sourceRevisionFingerprint,
        siteOrigin: "https://www.neffigie.com",
        diagnostics: new DiagnosticCollector(),
        media: noMedia(),
        plugins: createContentPlugins(new Set()),
      },
      {
        hash: "b".repeat(64),
        path: "/assets/resume/cv.pdf",
        fileName: "cv.pdf",
        mimeType: "application/pdf",
      },
    );

    expect(compiled).toMatchObject({
      kind: "resume",
      html: "",
      pinOrder: null,
      asset: { fileName: "cv.pdf" },
    });
  });
});
