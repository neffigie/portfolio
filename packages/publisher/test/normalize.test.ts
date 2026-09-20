import { describe, expect, it } from "vitest";

import {
  DiagnosticCollector,
  normalizeRecords,
  type SourceRecord,
} from "../src/index.js";

const baseRecord: SourceRecord = {
  id: "record",
  title: "Title",
  slug: "entry",
  summary: "Summary",
  bodyHtml: "<p>Body</p>",
  type: "writing",
  tags: [],
  date: "2026-09-20",
  pinOrder: null,
  asset: null,
  created: "2026-09-01T12:00:00.000Z",
  updated: "2026-09-20T12:00:00.000Z",
};

function record(
  id: string,
  overrides: Partial<SourceRecord> = {},
): SourceRecord {
  return {
    ...baseRecord,
    id,
    slug: id,
    title: id,
    ...overrides,
  };
}

function reservedRecords(): SourceRecord[] {
  return [
    record("home-id", {
      title: " Anna Noelle ",
      slug: "home",
      type: null,
      date: null,
    }),
    record("about-id", { slug: "about", type: null, date: null }),
    record("resume-id", {
      slug: "resume",
      type: null,
      date: null,
      asset: {
        kind: "pocketbase-file",
        recordId: "resume-id",
        collectionId: "entries",
        fileName: "anna-noelle-resume.pdf",
      },
    }),
  ];
}

function codes(diagnostics: DiagnosticCollector): string[] {
  return diagnostics.items.map(({ code }) => code);
}

describe("normalizeRecords", () => {
  it("classifies reserved records, drafts, and published entries", () => {
    const diagnostics = new DiagnosticCollector();
    const corpus = normalizeRecords(
      [
        ...reservedRecords(),
        record("draft-id", {
          slug: "rough-notes",
          type: null,
          date: null,
        }),
        record("project-id", {
          slug: "My Project",
          type: "project",
        }),
      ],
      diagnostics,
    );

    expect(diagnostics.items).toEqual([]);
    expect(corpus.home?.route).toBe("/");
    expect(corpus.home?.title).toBe("Anna Noelle");
    expect(corpus.about?.route).toBe("/about");
    expect(corpus.resume?.route).toBe("/resume");
    expect(corpus.drafts.map(({ slug }) => slug)).toEqual(["rough-notes"]);
    expect(corpus.entries.map(({ route }) => route)).toEqual(["/my-project"]);
  });

  it("reports every missing reserved record with a stable code", () => {
    const diagnostics = new DiagnosticCollector();

    normalizeRecords([], diagnostics);

    expect(codes(diagnostics)).toEqual([
      "route.missing-reserved",
      "route.missing-reserved",
      "route.missing-reserved",
    ]);
    expect(diagnostics.items.map(({ message }) => message)).toEqual([
      expect.stringContaining("home"),
      expect.stringContaining("about"),
      expect.stringContaining("resume"),
    ]);
  });

  it("reports canonical slug collisions and protected routes", () => {
    const diagnostics = new DiagnosticCollector();

    normalizeRecords(
      [
        ...reservedRecords(),
        record("one", { slug: "My Project" }),
        record("two", { slug: "my-project", type: "project" }),
        record("three", { slug: "index" }),
      ],
      diagnostics,
    );

    expect(codes(diagnostics)).toContain("route.slug-collision");
    expect(codes(diagnostics)).toContain("route.protected-slug");
  });

  it("reports unsafe draft slugs without publishing the draft", () => {
    const diagnostics = new DiagnosticCollector();
    const corpus = normalizeRecords(
      [
        ...reservedRecords(),
        record("unsafe-draft", {
          slug: "rough/notes",
          type: null,
          date: null,
        }),
      ],
      diagnostics,
    );

    expect(codes(diagnostics)).toContain("route.invalid-slug");
    expect(corpus.drafts.map(({ sourceId }) => sourceId)).toContain(
      "unsafe-draft",
    );
    expect(corpus.entries).toEqual([]);
  });

  it("reports every missing field required for publication", () => {
    const diagnostics = new DiagnosticCollector();

    normalizeRecords(
      [
        ...reservedRecords(),
        record("incomplete", {
          title: "  ",
          summary: " ",
          bodyHtml: "",
          date: null,
        }),
      ],
      diagnostics,
    );

    expect(
      codes(diagnostics).filter((code) => code === "schema.published-field"),
    ).toHaveLength(4);
  });

  it("rejects draft pins and duplicate published pin orders", () => {
    const diagnostics = new DiagnosticCollector();

    normalizeRecords(
      [
        ...reservedRecords(),
        record("draft", { type: null, date: null, pinOrder: 3 }),
        record("first", { pinOrder: 1 }),
        record("second", { type: "project", pinOrder: 1 }),
      ],
      diagnostics,
    );

    expect(codes(diagnostics)).toContain("schema.pin-draft");
    expect(codes(diagnostics)).toContain("schema.pin-duplicate");
  });

  it("normalizes and deduplicates tags while retaining the first label", () => {
    const diagnostics = new DiagnosticCollector();
    const corpus = normalizeRecords(
      [
        ...reservedRecords(),
        record("tagged", {
          tags: [" TypeScript ", "typescript", "HUGO", " hugo ", ""],
        }),
      ],
      diagnostics,
    );

    expect(diagnostics.items).toEqual([]);
    expect(corpus.entries[0]?.tags).toEqual([
      { key: "typescript", label: "TypeScript" },
      { key: "hugo", label: "HUGO" },
    ]);
  });

  it("sorts published entries newest-first and then by slug", () => {
    const diagnostics = new DiagnosticCollector();
    const corpus = normalizeRecords(
      [
        ...reservedRecords(),
        record("old", { date: "2025-01-01" }),
        record("zeta", { date: "2026-09-20" }),
        record("alpha", { date: "2026-09-20" }),
      ],
      diagnostics,
    );

    expect(diagnostics.items).toEqual([]);
    expect(corpus.entries.map(({ slug }) => slug)).toEqual([
      "alpha",
      "zeta",
      "old",
    ]);
    expect(corpus.entries[0]?.date).toBe("2026-09-20T00:00:00.000Z");
  });
});
