import type { MediaSourceResolver } from "../media/types.js";
import type { SourceAsset } from "../model.js";

function decodeSafeSegment(value: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return null;
  }
  if (
    decoded.length === 0 ||
    decoded === "." ||
    decoded === ".." ||
    decoded.includes("/") ||
    decoded.includes("\\") ||
    decoded.includes("\0")
  ) {
    return null;
  }
  return decoded;
}

export function parsePocketBaseFileUrl(
  source: string,
  expectedOrigin: string,
): SourceAsset | null {
  let sourceUrl: URL;
  let originUrl: URL;
  try {
    sourceUrl = new URL(source);
    originUrl = new URL(expectedOrigin);
  } catch {
    return null;
  }
  if (
    (sourceUrl.protocol !== "http:" && sourceUrl.protocol !== "https:") ||
    sourceUrl.origin !== originUrl.origin ||
    sourceUrl.username !== "" ||
    sourceUrl.password !== "" ||
    sourceUrl.search !== "" ||
    sourceUrl.hash !== ""
  ) {
    return null;
  }

  const parts = sourceUrl.pathname.split("/").filter(Boolean);
  if (parts.length !== 5 || parts[0] !== "api" || parts[1] !== "files") {
    return null;
  }
  const collectionId = decodeSafeSegment(parts[2] ?? "");
  const recordId = decodeSafeSegment(parts[3] ?? "");
  const fileName = decodeSafeSegment(parts[4] ?? "");
  if (collectionId === null || recordId === null || fileName === null) {
    return null;
  }
  return {
    kind: "pocketbase-file",
    collectionId,
    recordId,
    fileName,
  };
}

export function createPocketBaseMediaSourceResolver(
  origin: string,
): MediaSourceResolver {
  return (source, ownerId) => {
    if (source.startsWith("data:")) {
      return {
        kind: "data-uri",
        uri: source,
        originalName: `${ownerId}-embedded.png`,
      };
    }
    const asset = parsePocketBaseFileUrl(source, origin);
    if (asset === null) {
      throw new TypeError(
        "Authored media is not a recognized PocketBase file URL.",
      );
    }
    return asset;
  };
}
