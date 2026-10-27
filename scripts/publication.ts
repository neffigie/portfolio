import { randomUUID } from "node:crypto";
import { copyFile, cp, mkdir, rename, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// The one public address of the site. Hugo's baseURL and the publisher's
// internal-link origin are both derived from it.
export const SITE_ORIGIN = "https://www.neffigie.com";

export const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const publicationPath = resolve(repositoryRoot, "site/data/publication.json");
const staticAssets = resolve(repositoryRoot, "site/static/assets");

function isMissing(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

/** Installs a committed publication directory into the Hugo site atomically. */
export async function installPublication(
  outputDirectory: string,
): Promise<void> {
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
