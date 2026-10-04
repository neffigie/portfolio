import { describe, expect, it } from "vitest";

import {
  createPocketBaseAssetFetcher,
  PocketBaseAssetError,
  type PocketBaseFileGateway,
  type SourceAsset,
} from "../../src/index.js";

const asset: SourceAsset = {
  kind: "pocketbase-file",
  collectionId: "entries-id",
  recordId: "record-id",
  fileName: "resume.pdf",
};

describe("PocketBase protected asset fetcher", () => {
  it("obtains a token before fetching and returns response bytes", async () => {
    const events: string[] = [];
    const gateway: PocketBaseFileGateway = {
      async getFileToken() {
        events.push("token");
        return "short-lived";
      },
      fileUrl(_asset, token) {
        events.push(`url:${token}`);
        return `https://example.test/file?token=${token}`;
      },
      async fetch() {
        events.push("fetch");
        return new Response(Uint8Array.from([1, 2, 3]), {
          headers: { "content-type": "application/pdf" },
        });
      },
    };

    const fetched = await createPocketBaseAssetFetcher(gateway).fetch(asset);

    expect(events).toEqual(["token", "url:short-lived", "fetch"]);
    expect(fetched).toEqual({
      bytes: Uint8Array.from([1, 2, 3]),
      mimeType: "application/pdf",
      originalName: "resume.pdf",
    });
  });

  it("falls back to the source filename when content-type is absent", async () => {
    const fetcher = createPocketBaseAssetFetcher({
      async getFileToken() {
        return "token";
      },
      fileUrl() {
        return "https://example.test/file";
      },
      async fetch() {
        return new Response(Uint8Array.from([1]));
      },
    });

    await expect(fetcher.fetch(asset)).resolves.toMatchObject({
      mimeType: "application/pdf",
    });
  });

  it("refreshes authorization once after a rejected file request", async () => {
    let tokenCalls = 0;
    let fetchCalls = 0;
    const fetcher = createPocketBaseAssetFetcher({
      async getFileToken() {
        tokenCalls += 1;
        return `token-${tokenCalls}`;
      },
      fileUrl(_asset, token) {
        return `https://example.test/file?token=${token}`;
      },
      async fetch() {
        fetchCalls += 1;
        return fetchCalls === 1
          ? new Response(null, { status: 401 })
          : new Response(Uint8Array.from([9]), {
              headers: { "content-type": "application/pdf" },
            });
      },
    });

    await expect(fetcher.fetch(asset)).resolves.toMatchObject({
      bytes: Uint8Array.from([9]),
    });
    expect(tokenCalls).toBe(2);
    expect(fetchCalls).toBe(2);
  });

  it("returns a redacted stable error for a failed download", async () => {
    const token = "never-log-this-token";
    const fetcher = createPocketBaseAssetFetcher({
      async getFileToken() {
        return token;
      },
      fileUrl() {
        return `https://example.test/file?token=${token}`;
      },
      async fetch() {
        return new Response(null, { status: 500 });
      },
    });

    const error = await fetcher.fetch(asset).catch((caught) => caught);

    expect(error).toBeInstanceOf(PocketBaseAssetError);
    expect(error).toMatchObject({ code: "pocketbase.asset" });
    expect(String(error)).not.toContain(token);
    expect(String(error)).not.toContain("example.test");
  });
});
