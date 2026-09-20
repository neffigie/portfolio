import { describe, expect, it } from "vitest";

import {
  assembleSnapshot,
  type CompiledEntry,
  type MediaManifestEntry,
  type SnapshotInput,
} from "../src/index.js";

const hashA = "a".repeat(64);
const hashB = "b".repeat(64);
const hashC = "c".repeat(64);
const sourceHashA = "d".repeat(64);
const sourceHashB = "e".repeat(64);

const entryA: CompiledEntry = {
  sourceId: "entry-a",
  title: "Compiler Design",
  slug: "compiler-design",
  route: "/compiler-design",
  summary: "How the content compiler works.",
  type: "project",
  tags: [{ key: "typescript", label: "TypeScript" }],
  date: "2026-09-20T00:00:00.000Z",
  updated: "2026-09-20T12:00:00.000Z",
  pinOrder: 2,
  html: "<p>Compiler body</p>",
  searchableText: "Compiler body",
  mediaHashes: [hashA],
  entryContentFingerprint: hashA,
  sourceRevisionFingerprint: sourceHashA,
};

const entryB: CompiledEntry = {
  ...entryA,
  sourceId: "entry-b",
  title: "Search Everywhere",
  slug: "search-everywhere",
  route: "/search-everywhere",
  date: "2026-08-01T00:00:00.000Z",
  pinOrder: 1,
  mediaHashes: [],
  entryContentFingerprint: hashB,
};

const mediaA: MediaManifestEntry = {
  hash: hashA,
  mimeType: "image/webp",
  width: 1200,
  height: 800,
  fallbackPath: `/assets/media/${hashA}.webp`,
  variants: [
    {
      path: `/assets/media/${hashA}-640.webp`,
      width: 640,
      height: 427,
      mimeType: "image/webp",
    },
  ],
  ownerIds: ["entry-a"],
};

const baseInput: SnapshotInput = {
  sourceRevisionFingerprint: sourceHashA,
  generatedAt: "2026-09-20T15:00:00.000Z",
  reserved: {
    home: {
      sourceId: "home-id",
      title: "Anna Noelle",
      summary: "Software engineer and creative builder.",
      html: "<p>Introduction</p>",
      updated: "2026-09-20T12:00:00.000Z",
    },
    about: {
      sourceId: "about-id",
      title: "About",
      summary: "About Anna Noelle.",
      html: "<p>About body</p>",
      updated: "2026-09-20T12:00:00.000Z",
    },
    resume: {
      sourceId: "resume-id",
      title: "Résumé",
      summary: "Anna Noelle's résumé.",
      html: "",
      updated: "2026-09-20T12:00:00.000Z",
      asset: {
        hash: hashB,
        path: "/assets/resume/anna-noelle-resume.pdf",
        fileName: "anna-noelle-resume.pdf",
        mimeType: "application/pdf",
      },
    },
  },
  entries: [entryB, entryA],
  media: [mediaA],
  compiler: {
    version: "0.0.0",
    contentPipelineVersion: 1,
  },
};

function withInput(overrides: Partial<SnapshotInput>): SnapshotInput {
  return { ...baseInput, ...overrides };
}

describe("assembleSnapshot", () => {
  it("assembles a validated, deterministically ordered snapshot", () => {
    const snapshot = assembleSnapshot(baseInput);

    expect(snapshot.schemaVersion).toBe(1);
    expect(snapshot.entries.map(({ sourceId }) => sourceId)).toEqual([
      "entry-a",
      "entry-b",
    ]);
    expect(snapshot.pins).toEqual([
      { sourceId: "entry-b", route: "/search-everywhere", pinOrder: 1 },
      { sourceId: "entry-a", route: "/compiler-design", pinOrder: 2 },
    ]);
    expect(snapshot.fullContentFingerprint).toMatch(/^[0-9a-f]{64}$/u);
  });

  it("keeps the full-content identity stable across clocks and source revisions", () => {
    const inputA = baseInput;
    const inputB = withInput({
      generatedAt: "2026-09-21T15:00:00.000Z",
      sourceRevisionFingerprint: sourceHashB,
      reserved: {
        resume: {
          ...baseInput.reserved.resume,
          updated: "2026-09-21T12:00:00.000Z",
        },
        about: {
          ...baseInput.reserved.about,
          updated: "2026-09-21T12:00:00.000Z",
        },
        home: {
          ...baseInput.reserved.home,
          updated: "2026-09-21T12:00:00.000Z",
        },
      },
      entries: baseInput.entries.map((entry) => ({
        ...entry,
        updated: "2026-09-21T12:00:00.000Z",
        sourceRevisionFingerprint: sourceHashB,
      })),
    });

    expect(assembleSnapshot(inputA).fullContentFingerprint).toBe(
      assembleSnapshot(inputB).fullContentFingerprint,
    );
  });

  it.each([
    {
      label: "compiled body HTML",
      change: () =>
        withInput({
          entries: [{ ...entryA, html: "<p>Changed</p>" }, entryB],
        }),
    },
    {
      label: "résumé asset hash",
      change: () =>
        withInput({
          reserved: {
            ...baseInput.reserved,
            resume: {
              ...baseInput.reserved.resume,
              asset: { ...baseInput.reserved.resume.asset, hash: hashC },
            },
          },
        }),
    },
    {
      label: "media hash",
      change: () =>
        withInput({
          media: [
            {
              ...mediaA,
              hash: hashC,
              fallbackPath: `/assets/media/${hashC}.webp`,
            },
          ],
        }),
    },
    {
      label: "tag display label",
      change: () =>
        withInput({
          entries: [
            {
              ...entryA,
              tags: [{ key: "typescript", label: "Typescript" }],
            },
            entryB,
          ],
        }),
    },
    {
      label: "pin ordering",
      change: () =>
        withInput({
          entries: [
            { ...entryA, pinOrder: 1 },
            { ...entryB, pinOrder: 2 },
          ],
        }),
    },
  ])("changes identity when $label changes", ({ change }) => {
    expect(assembleSnapshot(change()).fullContentFingerprint).not.toBe(
      assembleSnapshot(baseInput).fullContentFingerprint,
    );
  });

  it("rejects an invalid generation timestamp at the schema boundary", () => {
    expect(() =>
      assembleSnapshot(withInput({ generatedAt: "today" })),
    ).toThrow();
  });
});
