#!/usr/bin/env -S node --import tsx

import { readFile } from "node:fs/promises";
import { basename, dirname, extname, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

import { z } from "zod";

import {
  type BuildPublicationDependencies,
  buildPublicationSnapshot,
} from "./build-snapshot.js";
import {
  CompilationFailure,
  type Diagnostic,
  formatDiagnostics,
} from "./diagnostics.js";
import type { AssetFetcher, MediaSource } from "./media/types.js";
import { SourceRecordSchema } from "./model.js";
import { CONTENT_PIPELINE_VERSION, PUBLISHER_VERSION } from "./version.js";

export interface BuildCliArguments {
  command: "build";
  source: string;
  out: string;
  siteOrigin: string;
  allowedWarnings: Set<string>;
}

function requireValue(
  args: readonly string[],
  index: number,
  flag: string,
): string {
  const value = args[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new TypeError(`${flag} requires a value.`);
  }
  return value;
}

function parseSiteOrigin(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new TypeError("--site-origin must be an absolute HTTP(S) origin.");
  }
  if (
    (url.protocol !== "https:" && url.protocol !== "http:") ||
    url.username.length > 0 ||
    url.password.length > 0 ||
    url.pathname !== "/" ||
    url.search.length > 0 ||
    url.hash.length > 0
  ) {
    throw new TypeError("--site-origin must be an absolute HTTP(S) origin.");
  }
  return url.origin;
}

export function parseCliArguments(args: readonly string[]): BuildCliArguments {
  if (args[0] !== "build") {
    throw new TypeError("Expected the build command.");
  }

  let source: string | undefined;
  let out: string | undefined;
  let siteOrigin: string | undefined;
  const allowedWarnings = new Set<string>();

  for (let index = 1; index < args.length; index += 2) {
    const flag = args[index];
    const value = requireValue(args, index, flag ?? "argument");
    if (flag === "--source") {
      source = value;
    } else if (flag === "--out") {
      out = value;
    } else if (flag === "--site-origin") {
      siteOrigin = parseSiteOrigin(value);
    } else if (flag === "--allow-warning") {
      allowedWarnings.add(value);
    } else {
      throw new TypeError(`Unknown argument ${JSON.stringify(flag)}.`);
    }
  }

  if (source === undefined) {
    throw new TypeError("--source is required.");
  }
  if (out === undefined) {
    throw new TypeError("--out is required.");
  }
  if (siteOrigin === undefined) {
    throw new TypeError("--site-origin is required.");
  }
  return { command: "build", source, out, siteOrigin, allowedWarnings };
}

export function unexpectedDiagnostics(
  diagnostics: readonly Diagnostic[],
  allowedWarnings: ReadonlySet<string>,
): Diagnostic[] {
  return diagnostics.filter(
    (diagnostic) =>
      diagnostic.severity === "error" || !allowedWarnings.has(diagnostic.code),
  );
}

function mimeTypeForPath(path: string): string {
  const extension = extname(path).toLowerCase();
  if (extension === ".png") {
    return "image/png";
  }
  if (extension === ".jpg" || extension === ".jpeg") {
    return "image/jpeg";
  }
  if (extension === ".webp") {
    return "image/webp";
  }
  if (extension === ".pdf") {
    return "application/pdf";
  }
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

function localAssetFetcher(sourceDirectory: string): AssetFetcher {
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

function localMediaSource(source: string, ownerId: string): MediaSource {
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
}

export interface CliIo {
  stdout(message: string): void;
  stderr(message: string): void;
}

const processIo: CliIo = {
  stdout: (message) => process.stdout.write(`${message}\n`),
  stderr: (message) => process.stderr.write(`${message}\n`),
};

export async function runCli(
  args: readonly string[],
  io: CliIo = processIo,
): Promise<number> {
  try {
    const options = parseCliArguments(args);
    const sourcePath = resolve(options.source);
    const records = z
      .array(SourceRecordSchema)
      .parse(JSON.parse(await readFile(sourcePath, "utf8")));
    const dependencies: BuildPublicationDependencies = {
      outputDirectory: resolve(options.out),
      generatedAt: new Date().toISOString(),
      siteOrigin: options.siteOrigin,
      compilerVersion: PUBLISHER_VERSION,
      contentPipelineVersion: CONTENT_PIPELINE_VERSION,
      assetFetcher: localAssetFetcher(dirname(sourcePath)),
      resolveMediaSource: localMediaSource,
    };
    const artifacts = await buildPublicationSnapshot(records, dependencies);
    const unexpected = unexpectedDiagnostics(
      artifacts.diagnostics,
      options.allowedWarnings,
    );
    if (unexpected.length > 0) {
      io.stderr(formatDiagnostics(unexpected));
      return 1;
    }
    io.stdout(
      `Published ${artifacts.snapshot.entries.length} entries to ${resolve(options.out)}.`,
    );
    return 0;
  } catch (error) {
    io.stderr(
      error instanceof CompilationFailure
        ? formatDiagnostics(error.diagnostics)
        : error instanceof Error
          ? error.message
          : String(error),
    );
    return 1;
  }
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  process.exitCode = await runCli(process.argv.slice(2));
}
