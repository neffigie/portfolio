import { resolve } from "node:path";

import { runCli } from "@portfolio/publisher";

import {
  installPublication,
  repositoryRoot,
  SITE_ORIGIN,
} from "./publication.js";

const sourcePath = resolve(repositoryRoot, "fixtures/site/source.json");
const outputDirectory = resolve(repositoryRoot, ".build/fixture-publication");

const exitCode = await runCli([
  "build",
  "--source",
  sourcePath,
  "--out",
  outputDirectory,
  "--site-origin",
  SITE_ORIGIN,
]);
if (exitCode !== 0) {
  process.exitCode = exitCode;
} else {
  await installPublication(outputDirectory);
}
