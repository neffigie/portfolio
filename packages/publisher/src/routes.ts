import type { EntryType } from "./model.js";

export const ROUTE_MANIFEST = {
  reserved: { home: "/", about: "/about", resume: "/resume" },
  protectedSegments: [
    "about",
    "index",
    "resume",
    "assets",
    "pagefind",
    "404.html",
  ],
} as const;

export type ReservedSlug = keyof typeof ROUTE_MANIFEST.reserved;

export type RouteResolution =
  | { classification: "reserved"; route: string }
  | { classification: "draft"; route: null }
  | { classification: "published"; route: string }
  | {
      classification: "invalid";
      route: null;
      code: "route.invalid-slug" | "route.protected-slug";
    };

const combiningMarks = /[\u0300-\u036f]/gu;
const nonSlugCharacters = /[^a-z0-9]+/gu;
const edgeHyphens = /^-+|-+$/gu;

export function canonicalizeSlug(value: string): string {
  return value
    .trim()
    .normalize("NFKD")
    .replace(combiningMarks, "")
    .toLowerCase()
    .replace(nonSlugCharacters, "-")
    .replace(edgeHyphens, "");
}

function isUnsafeAuthoredSlug(value: string): boolean {
  const trimmed = value.trim();
  return (
    trimmed.length === 0 ||
    trimmed.includes("/") ||
    trimmed.includes("..") ||
    trimmed.startsWith(".")
  );
}

function isProtectedSlug(authored: string, canonical: string): boolean {
  const authoredKey = authored.trim().toLowerCase();
  return ROUTE_MANIFEST.protectedSegments.some(
    (segment) =>
      authoredKey === segment || canonical === canonicalizeSlug(segment),
  );
}

function isReservedSlug(value: string): value is ReservedSlug {
  return Object.hasOwn(ROUTE_MANIFEST.reserved, value);
}

export function resolveRoute(
  slug: string,
  type: EntryType | null,
): RouteResolution {
  const canonical = canonicalizeSlug(slug);

  if (type === null) {
    if (isReservedSlug(canonical)) {
      return {
        classification: "reserved",
        route: ROUTE_MANIFEST.reserved[canonical],
      };
    }

    return { classification: "draft", route: null };
  }

  if (isUnsafeAuthoredSlug(slug) || canonical.length === 0) {
    return {
      classification: "invalid",
      route: null,
      code: "route.invalid-slug",
    };
  }

  if (isReservedSlug(canonical) || isProtectedSlug(slug, canonical)) {
    return {
      classification: "invalid",
      route: null,
      code: "route.protected-slug",
    };
  }

  return { classification: "published", route: `/${canonical}` };
}
