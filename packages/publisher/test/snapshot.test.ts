import { describe, expect, it } from "vitest";

import {
  assembleSnapshot,
  type MediaManifestEntry,
  type Post,
  type SnapshotInput,
} from "../src/index.js";

const hashA = "a".repeat(64);
const hashB = "b".repeat(64);
const hashC = "c".repeat(64);
const sourceHashA = "d".repeat(64);
const sourceHashB = "e".repeat(64);

const entryA: Post = {
  sourceId: "entry-a",
  kind: "project",
  title: "Compiler Design",
  slug: "compiler-design",
  route: "/compiler-design",
  previewText: "Content",
  tags: [{ key: "typescript", label: "TypeScript" }],
  date: "2026-09-20T00:00:00.000Z",
  updated: "2026-09-20T12:00:00.000Z",
  pinOrder: 2,
  html: "<p>Compiler body</p>",
  searchableText: "Compiler body",
  asset: null,
  mediaHashes: [hashA],
  contentFingerprint: hashA,
  sourceRevisionFingerprint: sourceHashA,
};

const entryB: Post = {
  ...entryA,
  sourceId: "entry-b",
  title: "Search Everywhere",
  slug: "search-everywhere",
  route: "/search-everywhere",
  date: "2026-08-01T00:00:00.000Z",
  pinOrder: 1,
  mediaHashes: [],
  contentFingerprint: hashB,
};

const home: Post = {
  ...entryA,
  sourceId: "home-id",
  kind: "home",
  title: "Anna Noelle",
  slug: "home",
  route: "/",
  previewText: "Introduction",
  tags: [],
  date: null,
  pinOrder: null,
  html: "<p>Introduction</p>",
  searchableText: "Introduction",
  mediaHashes: [],
};

const resume: Post = {
  ...home,
  sourceId: "resume-id",
  kind: "resume",
  title: "Résumé",
  slug: "resume",
  route: "/resume",
  previewText: "",
  html: "",
  searchableText: "",
  asset: {
    hash: hashB,
    path: "/assets/resume/anna-noelle-resume.pdf",
    fileName: "anna-noelle-resume.pdf",
    mimeType: "application/pdf",
  },
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
  posts: [entryB, resume, entryA, home],
  media: [mediaA],
  compiler: {
    version: "0.0.0",
    contentPipelineVersion: 1,
  },
};

function withInput(overrides: Partial<SnapshotInput>): SnapshotInput {
  return { ...baseInput, ...overrides };
}

function replacePost(sourceId: string, change: Partial<Post>): Post[] {
  return baseInput.posts.map((post) =>
    post.sourceId === sourceId ? ({ ...post, ...change } as Post) : post,
  );
}

describe("assembleSnapshot", () => {
  it("assembles a validated, deterministically ordered snapshot", () => {
    const snapshot = assembleSnapshot(baseInput);

    expect(snapshot.schemaVersion).toBe(2);
    expect(snapshot.posts.map(({ sourceId }) => sourceId)).toEqual([
      "home-id",
      "resume-id",
      "entry-a",
      "entry-b",
    ]);
    expect(snapshot.fullContentFingerprint).toMatch(/^[0-9a-f]{64}$/u);
  });

  it("keeps the full-content identity stable across clocks and source revisions", () => {
    const inputB = withInput({
      generatedAt: "2026-09-21T15:00:00.000Z",
      sourceRevisionFingerprint: sourceHashB,
      posts: baseInput.posts.map((post) => ({
        ...post,
        updated: "2026-09-21T12:00:00.000Z",
        sourceRevisionFingerprint: sourceHashB,
      })),
    });

    expect(assembleSnapshot(baseInput).fullContentFingerprint).toBe(
      assembleSnapshot(inputB).fullContentFingerprint,
    );
  });

  it.each([
    {
      label: "compiled body HTML",
      change: () =>
        withInput({
          posts: replacePost("entry-a", { html: "<p>Changed</p>" }),
        }),
    },
    {
      label: "résumé asset hash",
      change: () =>
        withInput({
          posts: replacePost("resume-id", {
            asset: {
              ...(resume.asset as NonNullable<Post["asset"]>),
              hash: hashC,
            },
          }),
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
          posts: replacePost("entry-a", {
            tags: [{ key: "typescript", label: "Typescript" }],
          }),
        }),
    },
    {
      label: "pin ordering",
      change: () =>
        withInput({
          posts: replacePost("entry-a", { pinOrder: 1 }).map((post) =>
            post.sourceId === "entry-b" ? { ...post, pinOrder: 2 } : post,
          ),
        }),
    },
  ])("changes identity when $label changes", ({ change }) => {
    expect(assembleSnapshot(change()).fullContentFingerprint).not.toBe(
      assembleSnapshot(baseInput).fullContentFingerprint,
    );
  });

  it("requires exactly one home and one résumé post", () => {
    expect(() =>
      assembleSnapshot(
        withInput({
          posts: baseInput.posts.filter(({ kind }) => kind !== "resume"),
        }),
      ),
    ).toThrow(/exactly one resume/u);
    expect(() =>
      assembleSnapshot(withInput({ posts: [...baseInput.posts, home] })),
    ).toThrow(/exactly one home/u);
  });

  it("rejects a listed post without a date and a pinned special post", () => {
    expect(() =>
      assembleSnapshot(
        withInput({ posts: replacePost("entry-a", { date: null }) }),
      ),
    ).toThrow(/requires a date/u);
    expect(() =>
      assembleSnapshot(
        withInput({ posts: replacePost("home-id", { pinOrder: 1 }) }),
      ),
    ).toThrow(/cannot be pinned/u);
  });

  it("rejects an invalid generation timestamp at the schema boundary", () => {
    expect(() =>
      assembleSnapshot(withInput({ generatedAt: "today" })),
    ).toThrow();
  });
});
