#!/usr/bin/env -S node --import tsx

import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { runCli } from "./cli/run.js";

export type { BuildCliArguments } from "./cli/arguments.js";
export { parseCliArguments, unexpectedDiagnostics } from "./cli/arguments.js";
export type { CliIo } from "./cli/run.js";
export { runCli };

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  process.exitCode = await runCli(process.argv.slice(2));
}
