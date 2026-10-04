import { readFile } from "node:fs/promises";
import { basename, extname, relative, resolve, sep } from "node:path";

import type {
  AssetFetcher,
  MediaSource,
  MediaSourceResolver,
} from "../media/types.js";

function mimeTypeForPath(path: string): string {
  const extension = extname(path).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".pdf") return "application/pdf";
  return "application/octet-stream";
}

function localPath(root: string, fileName: string): string {
  const destination = resolve(root, fileName.replace(/^[/\\]+/u, ""));
  const fromRoot = relative(root, destination);
  if (fromRoot === ".." || fromRoot.startsWith(`..${sep}`)) {
    throw new TypeError("A local asset path escaped the source directory.");
  }
  return destination;
}

export function createLocalAssetFetcher(sourceDirectory: string): AssetFetcher {
  return {
    async fetch(asset) {
      const path = localPath(sourceDirectory, asset.fileName);
      return {
        bytes: await readFile(path),
        mimeType: mimeTypeForPath(path),
        originalName: basename(path),
      };
    },
  };
}

export const resolveLocalMediaSource: MediaSourceResolver = (
  source,
  ownerId,
): MediaSource => {
  if (source.startsWith("data:")) {
    const mimeType = /^data:([^;,]+)/u.exec(source)?.[1]?.toLowerCase();
    const extension =
      mimeType === "image/jpeg"
        ? "jpg"
        : mimeType === "image/webp"
          ? "webp"
          : "png";
    return {
      kind: "data-uri",
      uri: source,
      originalName: `${ownerId}-embedded.${extension}`,
    };
  }
  if (/^https?:\/\//iu.test(source)) {
    throw new TypeError(
      "The local CLI does not fetch remote media; provide a local artifact source.",
    );
  }
  return {
    kind: "pocketbase-file",
    collectionId: "local",
    recordId: ownerId,
    fileName: source,
  };
};
