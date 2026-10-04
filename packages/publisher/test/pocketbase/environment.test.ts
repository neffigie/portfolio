import { describe, expect, it } from "vitest";

import { readPocketBaseEnvironment } from "../../src/index.js";

const completeEnvironment = {
  POCKETBASE_URL: "https://neffigie.pockethost.io",
  POCKETBASE_SUPERUSER_EMAIL: "publisher@example.com",
  POCKETBASE_SUPERUSER_PASSWORD: "private-password",
};

describe("readPocketBaseEnvironment", () => {
  it.each([
    ["http://neffigie.pockethost.io/", "http://neffigie.pockethost.io"],
    ["https://neffigie.pockethost.io/", "https://neffigie.pockethost.io"],
  ])("normalizes the PocketBase origin %s", (input, expected) => {
    expect(
      readPocketBaseEnvironment({
        ...completeEnvironment,
        POCKETBASE_URL: input,
      }).url,
    ).toBe(expected);
  });

  it.each([
    "https://user:password@neffigie.pockethost.io",
    "https://neffigie.pockethost.io/path",
    "https://neffigie.pockethost.io?token=value",
    "https://neffigie.pockethost.io#fragment",
    "ftp://neffigie.pockethost.io",
  ])("rejects a URL that is not a plain HTTP(S) origin: %s", (url) => {
    expect(() =>
      readPocketBaseEnvironment({
        ...completeEnvironment,
        POCKETBASE_URL: url,
      }),
    ).toThrow(/POCKETBASE_URL/u);
  });

  it("names only the missing environment variable", () => {
    expect(() =>
      readPocketBaseEnvironment({
        POCKETBASE_URL: completeEnvironment.POCKETBASE_URL,
        POCKETBASE_SUPERUSER_PASSWORD:
          completeEnvironment.POCKETBASE_SUPERUSER_PASSWORD,
      }),
    ).toThrow(/POCKETBASE_SUPERUSER_EMAIL/u);
  });

  it("never includes a supplied password in an error", () => {
    const secret = "do-not-include-this-password";
    let message = "";
    try {
      readPocketBaseEnvironment({
        ...completeEnvironment,
        POCKETBASE_URL: "not a URL",
        POCKETBASE_SUPERUSER_PASSWORD: secret,
      });
    } catch (error) {
      message = String(error);
    }

    expect(message).toContain("POCKETBASE_URL");
    expect(message).not.toContain(secret);
  });

  it("does not accept browser-exposed NEXT_PUBLIC aliases", () => {
    expect(() =>
      readPocketBaseEnvironment({
        NEXT_PUBLIC_POCKETBASE_URL: completeEnvironment.POCKETBASE_URL,
        NEXT_PUBLIC_POCKETBASE_SUPERUSER_EMAIL:
          completeEnvironment.POCKETBASE_SUPERUSER_EMAIL,
        NEXT_PUBLIC_POCKETBASE_SUPERUSER_PASSWORD:
          completeEnvironment.POCKETBASE_SUPERUSER_PASSWORD,
      }),
    ).toThrow(/POCKETBASE_URL/u);
  });
});
