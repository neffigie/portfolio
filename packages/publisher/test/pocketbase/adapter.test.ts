import { describe, expect, it } from "vitest";

import {
  createPocketBaseSourceFromGateway,
  mapPocketBaseEntry,
  type PocketBaseRecordGateway,
  PocketBaseSourceError,
} from "../../src/index.js";

const baseRecord = {
  id: "entry-1",
  collectionId: "entries-id",
  title: "Search as Navigation",
  slug: "writing-one",
  body: "<p>Search</p>",
  type: "writing",
  tags: ["Search", "Systems"],
  date: "2026-08-20 00:00:00.000Z",
  pin_order: 1,
  asset: "",
  created: "2026-09-01 12:00:00.000Z",
  updated: "2026-09-20 12:00:00.000Z",
};

describe("mapPocketBaseEntry", () => {
  it("maps a published record into the neutral source contract", () => {
    expect(mapPocketBaseEntry(baseRecord)).toEqual({
      id: "entry-1",
      title: "Search as Navigation",
      slug: "writing-one",
      bodyHtml: "<p>Search</p>",
      type: "writing",
      tags: ["Search", "Systems"],
      date: "2026-08-20 00:00:00.000Z",
      pinOrder: 1,
      asset: null,
      created: "2026-09-01 12:00:00.000Z",
      updated: "2026-09-20 12:00:00.000Z",
    });
  });

  it("removes editor formatting newlines between block elements", () => {
    expect(
      mapPocketBaseEntry({
        ...baseRecord,
        body: "<h2>Title</h2>\n <p>First</p>\n <blockquote><p>Quote</p></blockquote>",
      }).bodyHtml,
    ).toBe("<h2>Title</h2><p>First</p><blockquote><p>Quote</p></blockquote>");
  });

  it("preserves whitespace between inline elements", () => {
    expect(
      mapPocketBaseEntry({
        ...baseRecord,
        body: "<p><strong>one</strong>\n <em>two</em></p>",
      }).bodyHtml,
    ).toBe("<p><strong>one</strong>\n <em>two</em></p>");
  });

  it("maps PocketBase zero values into nullable source values", () => {
    expect(
      mapPocketBaseEntry({
        ...baseRecord,
        id: "home-id",
        slug: "home",
        type: "",
        tags: null,
        date: "",
        pin_order: 0,
        asset: "",
      }),
    ).toMatchObject({
      id: "home-id",
      type: null,
      tags: [],
      date: null,
      pinOrder: null,
      asset: null,
    });
  });

  it("maps an empty multi-select tag value into an empty tag list", () => {
    expect(mapPocketBaseEntry({ ...baseRecord, tags: "" }).tags).toEqual([]);
  });

  it("describes a populated PocketBase file without exposing a URL", () => {
    expect(
      mapPocketBaseEntry({
        ...baseRecord,
        id: "resume-id",
        slug: "resume",
        type: "",
        date: "",
        pin_order: 0,
        asset: "anna-noelle-resume.pdf",
      }).asset,
    ).toEqual({
      kind: "pocketbase-file",
      collectionId: "entries-id",
      recordId: "resume-id",
      fileName: "anna-noelle-resume.pdf",
    });
  });

  it("rejects a non-string tag at the external boundary", () => {
    expect(() =>
      mapPocketBaseEntry({ ...baseRecord, tags: ["Search", 7] }),
    ).toThrow(/tags/u);
  });
});

describe("PocketBase source adapter", () => {
  it("consumes every page and returns records in deterministic ID order", async () => {
    const calls: Array<[number, number]> = [];
    const gateway: PocketBaseRecordGateway = {
      async listEntries(page, perPage) {
        calls.push([page, perPage]);
        return {
          page,
          totalPages: 2,
          items:
            page === 1
              ? [{ ...baseRecord, id: "z-record", slug: "z-record" }]
              : [{ ...baseRecord, id: "a-record", slug: "a-record" }],
        };
      },
    };

    const records =
      await createPocketBaseSourceFromGateway(gateway).listSourceRecords();

    expect(calls).toEqual([
      [1, 200],
      [2, 200],
    ]);
    expect(records.map(({ id }) => id)).toEqual(["a-record", "z-record"]);
  });

  it("distinguishes a valid empty collection from a request failure", async () => {
    const source = createPocketBaseSourceFromGateway({
      async listEntries() {
        return { page: 1, totalPages: 0, items: [] };
      },
    });

    await expect(source.listSourceRecords()).resolves.toEqual([]);
  });

  it("redacts authentication failure details", async () => {
    const secret = "do-not-log-this-password";
    const source = createPocketBaseSourceFromGateway({
      async listEntries() {
        throw Object.assign(new Error(`bad password ${secret}`), {
          status: 401,
        });
      },
    });

    const error = await source.listSourceRecords().catch((caught) => caught);

    expect(error).toBeInstanceOf(PocketBaseSourceError);
    expect(error).toMatchObject({ code: "pocketbase.authentication" });
    expect(String(error)).not.toContain(secret);
  });

  it("classifies transport failures without retaining tokenized URLs", async () => {
    const token = "private-file-token";
    const source = createPocketBaseSourceFromGateway({
      async listEntries() {
        throw new TypeError(
          `fetch failed https://example.invalid/api?token=${token}`,
        );
      },
    });

    const error = await source.listSourceRecords().catch((caught) => caught);

    expect(error).toMatchObject({ code: "pocketbase.transport" });
    expect(String(error)).not.toContain(token);
  });
});
