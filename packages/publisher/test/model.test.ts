import { describe, expect, it } from "vitest";

import {
  CompiledEntrySchema,
  type PublicationSnapshot,
  PublicationSnapshotSchema,
  type SourceRecord,
  SourceRecordSchema,
} from "../src/index.js";

const fingerprint = "a".repeat(64);

const validSource: SourceRecord = {
  id: "entry-1",
  title: "Compiler Design",
  slug: "compiler-design",
  bodyHtml: "<p>Content</p>",
  type: "project",
  tags: ["TypeScript", "Hugo"],
  date: "2026-09-20",
  pinOrder: 1,
  asset: null,
  created: "2026-09-01T12:00:00.000Z",
  updated: "2026-09-20T12:00:00.000Z",
};

const validSnapshot: PublicationSnapshot = {
  schemaVersion: 1,
  sourceRevisionFingerprint: fingerprint,
  fullContentFingerprint: fingerprint,
  generatedAt: "2026-09-20T15:00:00.000Z",
  reserved: {
    home: {
      sourceId: "home-record",
      title: "Anna Noelle",
      html: "<p>Introduction</p>",
      updated: "2026-09-20T12:00:00.000Z",
    },
    resume: {
      sourceId: "resume-record",
      title: "Résumé",
      html: "",
      updated: "2026-09-20T12:00:00.000Z",
      asset: {
        hash: fingerprint,
        path: "/assets/resume/resume.pdf",
        fileName: "anna-noelle-resume.pdf",
        mimeType: "application/pdf",
      },
    },
  },
  entries: [],
  pins: [],
  media: [],
  compiler: {
    name: "@portfolio/publisher",
    version: "0.0.0",
    contentPipelineVersion: 1,
  },
};

describe("SourceRecordSchema", () => {
  it("accepts authored content without a separate summary", () => {
    expect(SourceRecordSchema.parse(validSource)).toEqual(validSource);
  });

  it("accepts the neutral source record contract", () => {
    expect(SourceRecordSchema.parse(validSource).type).toBe("project");
  });

  it("rejects a content type outside writing and project", () => {
    expect(SourceRecordSchema).toBeDefined();
    expect(() =>
      SourceRecordSchema.parse({ ...validSource, type: "note" }),
    ).toThrow();
  });

  it("rejects zero as a pin order", () => {
    expect(SourceRecordSchema).toBeDefined();
    expect(() =>
      SourceRecordSchema.parse({ ...validSource, pinOrder: 0 }),
    ).toThrow();
  });
});

describe("source-independent publication schemas", () => {
  it("rejects PocketBase-specific data on a compiled entry", () => {
    const compiled = {
      sourceId: "entry-1",
      title: "Compiler Design",
      slug: "compiler-design",
      route: "/compiler-design",
      previewText: "Content",
      type: "project",
      tags: [{ key: "typescript", label: "TypeScript" }],
      date: "2026-09-20T00:00:00.000Z",
      updated: "2026-09-20T12:00:00.000Z",
      pinOrder: 1,
      html: "<p>Content</p>",
      searchableText: "Content",
      mediaHashes: [],
      entryContentFingerprint: fingerprint,
      sourceRevisionFingerprint: fingerprint,
      pocketBaseUrl:
        "https://cms.invalid/api/collections/entries/records/entry-1",
    };

    expect(CompiledEntrySchema).toBeDefined();
    expect(() => CompiledEntrySchema.parse(compiled)).toThrow();
  });

  it("rejects a snapshot schema version the reader does not support", () => {
    expect(PublicationSnapshotSchema).toBeDefined();
    expect(() =>
      PublicationSnapshotSchema.parse({ ...validSnapshot, schemaVersion: 2 }),
    ).toThrow();
  });

  it("accepts a complete schema-v1 snapshot", () => {
    expect(PublicationSnapshotSchema.parse(validSnapshot)).toEqual(
      validSnapshot,
    );
  });

  it("requires only home and résumé as reserved content", () => {
    expect(PublicationSnapshotSchema.parse(validSnapshot).reserved).toEqual(
      validSnapshot.reserved,
    );
    expect(() =>
      PublicationSnapshotSchema.parse({
        ...validSnapshot,
        reserved: {
          ...validSnapshot.reserved,
          about: { title: "Unreleased page" },
        },
      }),
    ).toThrow();
  });
});
