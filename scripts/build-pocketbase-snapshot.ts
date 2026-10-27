import { resolve } from "node:path";

import {
  buildPublicationSnapshot,
  CONTENT_PIPELINE_VERSION,
  createPocketBaseSource,
  PUBLISHER_VERSION,
  readPocketBaseEnvironment,
} from "@portfolio/publisher";

import {
  installPublication,
  repositoryRoot,
  SITE_ORIGIN,
} from "./publication.js";

const outputDirectory = resolve(
  repositoryRoot,
  ".build/pocketbase-publication",
);

const credentials = readPocketBaseEnvironment(process.env);
const source = await createPocketBaseSource(credentials);
const records = await source.listSourceRecords();
const artifacts = await buildPublicationSnapshot(records, {
  outputDirectory,
  generatedAt: new Date().toISOString(),
  siteOrigin: SITE_ORIGIN,
  compilerVersion: PUBLISHER_VERSION,
  contentPipelineVersion: CONTENT_PIPELINE_VERSION,
  assetFetcher: source.assetFetcher,
  resolveMediaSource: source.resolveMediaSource,
});
await installPublication(outputDirectory);

process.stdout.write(
  `Published ${artifacts.snapshot.posts.length} posts and ${artifacts.mediaWrites.length} media artifacts to ${outputDirectory}.\n`,
);
