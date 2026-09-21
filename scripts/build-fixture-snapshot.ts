import { copyFile, cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { runCli } from "@portfolio/publisher";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const sourcePath = resolve(repositoryRoot, "fixtures/site/source.json");
const outputDirectory = resolve(repositoryRoot, ".build/fixture-publication");
const publicationPath = resolve(repositoryRoot, "site/data/publication.json");
const staticAssets = resolve(repositoryRoot, "site/static/assets");

await rm(outputDirectory, { recursive: true, force: true });
await rm(staticAssets, { recursive: true, force: true });

const exitCode = await runCli([
  "build",
  "--source",
  sourcePath,
  "--out",
  outputDirectory,
  "--site-origin",
  "https://neffigie.dev",
]);
if (exitCode !== 0) {
  process.exitCode = exitCode;
} else {
  await mkdir(dirname(publicationPath), { recursive: true });
  await copyFile(resolve(outputDirectory, "snapshot.json"), publicationPath);
  await cp(resolve(outputDirectory, "assets"), staticAssets, {
    recursive: true,
  });
}
