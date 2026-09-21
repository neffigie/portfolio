import { describe, expect, it } from "vitest";

import { decodeDataUri } from "../../src/index.js";

describe("decodeDataUri", () => {
  it("decodes base64 image bytes and normalizes the MIME type", () => {
    const decoded = decodeDataUri(
      "data:IMAGE/PNG;charset=binary;base64,AAECA/8=",
    );

    expect(decoded.mimeType).toBe("image/png");
    expect([...decoded.bytes]).toEqual([0, 1, 2, 3, 255]);
  });

  it("decodes percent-encoded bytes", () => {
    const decoded = decodeDataUri("data:image/png,hello%20media%21");

    expect(new TextDecoder().decode(decoded.bytes)).toBe("hello media!");
  });

  it("rejects unsupported MIME types", () => {
    expect(() =>
      decodeDataUri("data:text/html,%3Cb%3Eunsafe%3C%2Fb%3E"),
    ).toThrow(/unsupported/iu);
  });

  it.each([
    "not-a-data-uri",
    "data:image/png;base64,%%%",
    "data:image/png,%E0%A4%A",
    "data:image/png;base64,",
  ])("rejects malformed or empty input %j", (value) => {
    expect(() => decodeDataUri(value)).toThrow();
  });
});
