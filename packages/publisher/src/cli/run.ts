import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { z } from "zod";

import {
  type BuildPublicationDependencies,
  buildPublicationSnapshot,
} from "../build-snapshot.js";
import { CompilationFailure, formatDiagnostics } from "../diagnostics.js";
import { SourceRecordSchema } from "../model.js";
import { CONTENT_PIPELINE_VERSION, PUBLISHER_VERSION } from "../version.js";
import { parseCliArguments, unexpectedDiagnostics } from "./arguments.js";
import {
  createLocalAssetFetcher,
  resolveLocalMediaSource,
} from "./local-source.js";

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
      assetFetcher: createLocalAssetFetcher(dirname(sourcePath)),
      resolveMediaSource: resolveLocalMediaSource,
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
