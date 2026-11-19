import { describe, expect, it } from "vitest";

import {
  mapPocketBaseSocialLink,
  prepareSocialLinks,
  type SourceSocialLink,
} from "../src/index.js";

function social(
  service: SourceSocialLink["service"],
  overrides: Partial<SourceSocialLink> = {},
): SourceSocialLink {
  return {
    id: `${service}-id`,
    service,
    label: service,
    href: `https://example.com/${service}`,
    sortOrder: 10,
    enabled: true,
    updated: "2026-11-18T12:00:00.000Z",
    ...overrides,
  };
}

describe("prepareSocialLinks", () => {
  it("publishes only enabled records in explicit order", () => {
    expect(
      prepareSocialLinks([
        social("github", { sortOrder: 3 }),
        social("twitch", { sortOrder: 21, enabled: false }),
        social("email", {
          label: "anna@neffigie.com",
          href: "mailto:anna@neffigie.com",
          sortOrder: 1,
        }),
      ]),
    ).toEqual([
      {
        service: "email",
        label: "anna@neffigie.com",
        href: "mailto:anna@neffigie.com",
        sortOrder: 1,
      },
      {
        service: "github",
        label: "github",
        href: "https://example.com/github",
        sortOrder: 3,
      },
    ]);
  });

  it("rejects duplicate enabled order values and unsafe hrefs", () => {
    expect(() =>
      prepareSocialLinks([
        social("github", { sortOrder: 2 }),
        social("linkedin", { sortOrder: 2 }),
      ]),
    ).toThrow(/sort order 2/u);
    expect(() =>
      prepareSocialLinks([social("github", { href: "javascript:alert(1)" })]),
    ).toThrow(/href/u);
  });
});

describe("mapPocketBaseSocialLink", () => {
  it("maps the external record into the neutral source contract", () => {
    expect(
      mapPocketBaseSocialLink({
        id: "youtube-id",
        service: "youtube",
        label: "youtube",
        href: "https://www.youtube.com/@neffigie",
        sort_order: 12,
        enabled: true,
        updated: "2026-11-18 12:00:00.000Z",
      }),
    ).toEqual({
      id: "youtube-id",
      service: "youtube",
      label: "youtube",
      href: "https://www.youtube.com/@neffigie",
      sortOrder: 12,
      enabled: true,
      updated: "2026-11-18 12:00:00.000Z",
    });
  });

  it("normalizes the PocketBase x/twitter service key", () => {
    expect(
      mapPocketBaseSocialLink({
        id: "x-id",
        service: "x/twitter",
        label: "x/twitter",
        href: "https://x.com/neffigie",
        sort_order: 13,
        enabled: true,
        updated: "2026-11-18 12:00:00.000Z",
      }),
    ).toEqual({
      id: "x-id",
      service: "x",
      label: "x/twitter",
      href: "https://x.com/neffigie",
      sortOrder: 13,
      enabled: true,
      updated: "2026-11-18 12:00:00.000Z",
    });
  });

  it("rejects unsupported service keys", () => {
    expect(() =>
      mapPocketBaseSocialLink({
        id: "unknown-id",
        service: "myspace",
        label: "myspace",
        href: "https://example.com",
        sort_order: 1,
        enabled: true,
        updated: "2026-11-18 12:00:00.000Z",
      }),
    ).toThrow(/service/u);
  });
});
