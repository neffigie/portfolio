import { describe, expect, it } from "vitest";

import {
  canonicalizeSlug,
  ROUTE_MANIFEST,
  resolveRoute,
} from "../src/index.js";

describe("route manifest", () => {
  it("declares every reserved route and protected segment", () => {
    expect(ROUTE_MANIFEST).toEqual({
      reserved: { home: "/", about: "/about", resume: "/resume" },
      protectedSegments: [
        "about",
        "index",
        "resume",
        "assets",
        "pagefind",
        "404.html",
      ],
    });
  });

  it.each([
    ["home", null, { classification: "reserved", route: "/" }],
    ["about", null, { classification: "reserved", route: "/about" }],
    ["resume", null, { classification: "reserved", route: "/resume" }],
    ["rough-notes", null, { classification: "draft", route: null }],
    [
      "My Project",
      "project",
      { classification: "published", route: "/my-project" },
    ],
  ] as const)("resolves %s according to its type", (slug, type, expected) => {
    expect(resolveRoute(slug, type)).toEqual(expected);
  });

  it("rejects protected published slugs", () => {
    expect(resolveRoute("index", "writing")).toMatchObject({
      classification: "invalid",
      route: null,
      code: "route.protected-slug",
    });
  });

  it.each(["", "///", "..", ".hidden", "nested/path"])(
    "rejects unsafe slug %j",
    (slug) => {
      expect(resolveRoute(slug, "writing")).toMatchObject({
        classification: "invalid",
        route: null,
      });
    },
  );

  it("canonicalizes authored text to lowercase ASCII kebab case", () => {
    expect(canonicalizeSlug("  Déjà Vu: A Résumé  ")).toBe("deja-vu-a-resume");
  });
});
