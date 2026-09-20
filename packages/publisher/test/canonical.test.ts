import { describe, expect, it } from "vitest";

import {
  canonicalStringify,
  type SourceRecord,
  sha256,
  sourceRevisionFingerprint,
} from "../src/index.js";

const recordA: SourceRecord = {
  id: "a",
  title: "Home",
  slug: "home",
  summary: "Anna Noelle",
  bodyHtml: "<p>Home</p>",
  type: null,
  tags: [],
  date: null,
  pinOrder: null,
  asset: null,
  created: "2026-09-01T12:00:00.000Z",
  updated: "2026-09-20T12:00:00.000Z",
};

const recordB: SourceRecord = {
  ...recordA,
  id: "b",
  title: "Compiler Design",
  slug: "Compiler Design",
  type: "writing",
  date: "2026-09-20",
  pinOrder: 1,
  asset: {
    kind: "pocketbase-file",
    recordId: "b",
    collectionId: "entries",
    fileName: "cover.png",
  },
};

const draftOriginal: SourceRecord = {
  ...recordA,
  id: "draft",
  slug: "rough-notes",
  title: "Rough notes",
  updated: "2026-09-20T12:00:00.000Z",
};

const draftChanged: SourceRecord = {
  ...draftOriginal,
  title: "Entirely rewritten rough notes",
  bodyHtml: "<p>Changed draft</p>",
  updated: "2026-09-21T12:00:00.000Z",
};

describe("canonical serialization", () => {
  it("sorts object keys recursively without reordering arrays", () => {
    expect(canonicalStringify({ b: 1, a: { z: 3, y: [2, 1] } })).toBe(
      '{"a":{"y":[2,1],"z":3},"b":1}',
    );
  });

  it("encodes Date instances as UTC ISO strings", () => {
    expect(
      canonicalStringify({ at: new Date("2026-09-20T08:00:00-04:00") }),
    ).toBe('{"at":"2026-09-20T12:00:00.000Z"}');
  });

  it.each([
    { value: undefined, label: "undefined" },
    { value: Number.POSITIVE_INFINITY, label: "non-finite number" },
    { value: () => true, label: "function" },
  ])("rejects $label values", ({ value }) => {
    expect(() => canonicalStringify(value)).toThrow();
  });

  it("rejects cyclic values", () => {
    const cyclic: { self?: unknown } = {};
    cyclic.self = cyclic;

    expect(() => canonicalStringify(cyclic)).toThrow(/cyclic/iu);
  });

  it("hashes the canonical UTF-8 representation with SHA-256", () => {
    expect(sha256("anna noelle")).toMatch(/^[0-9a-f]{64}$/u);
    expect(sha256("anna noelle")).toBe(sha256("anna noelle"));
    expect(sha256("anna noelle")).not.toBe(sha256("neffigie"));
  });
});

describe("source revision fingerprint", () => {
  it("is independent of source record order", () => {
    expect(sourceRevisionFingerprint([recordB, recordA])).toBe(
      sourceRevisionFingerprint([recordA, recordB]),
    );
  });

  it("ignores excluded draft changes", () => {
    expect(sourceRevisionFingerprint([draftChanged])).toBe(
      sourceRevisionFingerprint([draftOriginal]),
    );
  });

  it("changes with included record metadata and asset identity", () => {
    expect(
      sourceRevisionFingerprint([
        {
          ...recordB,
          asset: {
            kind: "pocketbase-file",
            recordId: "b",
            collectionId: "entries",
            fileName: "new-cover.png",
          },
        },
      ]),
    ).not.toBe(sourceRevisionFingerprint([recordB]));
    expect(
      sourceRevisionFingerprint([
        { ...recordB, updated: "2026-09-21T12:00:00.000Z" },
      ]),
    ).not.toBe(sourceRevisionFingerprint([recordB]));
  });
});
