import { randomUUID } from "node:crypto";
import { copyFile, cp, mkdir, rename, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildPublicationSnapshot,
  CONTENT_PIPELINE_VERSION,
  createPocketBaseSource,
  PUBLISHER_VERSION,
  readPocketBaseEnvironment,
} from "@portfolio/publisher";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const outputDirectory = resolve(
  repositoryRoot,
  ".build/pocketbase-publication",
);
const publicationPath = resolve(repositoryRoot, "site/data/publication.json");
const staticAssets = resolve(repositoryRoot, "site/static/assets");

function isMissing(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

async function installPublication(): Promise<void> {
  const suffix = randomUUID();
  const pendingSnapshot = `${publicationPath}.partial-${suffix}`;
  const pendingAssets = `${staticAssets}.partial-${suffix}`;
  const previousAssets = `${staticAssets}.previous-${suffix}`;
  let hasPreviousAssets = false;

  await mkdir(dirname(publicationPath), { recursive: true });
  await mkdir(dirname(staticAssets), { recursive: true });
  try {
    await copyFile(resolve(outputDirectory, "snapshot.json"), pendingSnapshot);
    await cp(resolve(outputDirectory, "assets"), pendingAssets, {
      recursive: true,
    });
    try {
      await rename(staticAssets, previousAssets);
      hasPreviousAssets = true;
    } catch (error) {
      if (!isMissing(error)) throw error;
    }
    await rename(pendingAssets, staticAssets);
    await rename(pendingSnapshot, publicationPath);
    if (hasPreviousAssets) {
      await rm(previousAssets, { recursive: true, force: true });
    }
  } catch (error) {
    await rm(pendingSnapshot, { force: true });
    await rm(pendingAssets, { recursive: true, force: true });
    if (hasPreviousAssets) {
      await rm(staticAssets, { recursive: true, force: true });
      await rename(previousAssets, staticAssets);
    }
    throw error;
  }
}

const credentials = readPocketBaseEnvironment(process.env);
const source = await createPocketBaseSource(credentials);
const records = await source.listSourceRecords();
const artifacts = await buildPublicationSnapshot(records, {
  outputDirectory,
  generatedAt: new Date().toISOString(),
  siteOrigin: "https://neffigie.dev",
  compilerVersion: PUBLISHER_VERSION,
  contentPipelineVersion: CONTENT_PIPELINE_VERSION,
  assetFetcher: source.assetFetcher,
  resolveMediaSource: source.resolveMediaSource,
});
await installPublication();

process.stdout.write(
  `Published ${artifacts.snapshot.entries.length} entries and ${artifacts.mediaWrites.length} media artifacts to ${outputDirectory}.\n`,
);
