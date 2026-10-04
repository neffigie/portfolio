import { describe, expect, it } from "vitest";

import {
  createPocketBaseMediaSourceResolver,
  parsePocketBaseFileUrl,
} from "../../src/index.js";

const origin = "https://neffigie.pockethost.io";

describe("parsePocketBaseFileUrl", () => {
  it("maps a same-origin PocketBase file URL to a source asset", () => {
    expect(
      parsePocketBaseFileUrl(
        `${origin}/api/files/entries-id/record-id/image.png`,
        origin,
      ),
    ).toEqual({
      kind: "pocketbase-file",
      collectionId: "entries-id",
      recordId: "record-id",
      fileName: "image.png",
    });
  });

  it.each([
    "https://other.example/api/files/entries-id/record-id/image.png",
    `${origin}/api/files/entries-id/record-id`,
    `${origin}/api/files/entries-id/%2e%2e/image.png`,
    `${origin}/api/files/entries-id/record-id/image.png?token=authored-token`,
    `${origin}/api/files/entries-id/record-id/image.png#fragment`,
    "../relative/image.png",
  ])("rejects an untrusted or malformed source: %s", (source) => {
    expect(parsePocketBaseFileUrl(source, origin)).toBeNull();
  });
});

describe("createPocketBaseMediaSourceResolver", () => {
  it("keeps supported data URIs inside the existing media pipeline", () => {
    const resolver = createPocketBaseMediaSourceResolver(origin);

    expect(resolver("data:image/png;base64,AAAA", "entry-1")).toEqual({
      kind: "data-uri",
      uri: "data:image/png;base64,AAAA",
      originalName: "entry-1-embedded.png",
    });
  });

  it("rejects media that is not a recognized PocketBase URL", () => {
    const resolver = createPocketBaseMediaSourceResolver(origin);

    expect(() => resolver("/local/image.png", "entry-1")).toThrow(
      /recognized PocketBase file URL/u,
    );
  });
});
