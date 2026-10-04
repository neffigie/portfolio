import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  buildPublicationSnapshot,
  CONTENT_PIPELINE_VERSION,
  createPocketBaseSource,
  PUBLISHER_VERSION,
  type PublicationSnapshot,
  PublicationSnapshotSchema,
  readPocketBaseEnvironment,
} from "@portfolio/publisher";
import { afterEach, describe, expect, it } from "vitest";

import { repositoryRoot } from "./build-site.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((path) => rm(path, { recursive: true, force: true })),
  );
});

function publicProjection(snapshot: PublicationSnapshot) {
  return {
    home: {
      title: snapshot.reserved.home.title,
      html: snapshot.reserved.home.html,
    },
    resume: {
      title: snapshot.reserved.resume.title,
      html: snapshot.reserved.resume.html,
      mimeType: snapshot.reserved.resume.asset.mimeType,
    },
    entries: snapshot.entries.map(
      ({
        title,
        slug,
        route,
        previewText,
        type,
        tags,
        date,
        pinOrder,
        html,
        searchableText,
      }) => ({
        title,
        slug,
        route,
        previewText,
        type,
        tags,
        date,
        pinOrder,
        html,
        searchableText,
      }),
    ),
    pins: snapshot.pins.map(({ route, pinOrder }) => ({ route, pinOrder })),
  };
}

async function fixtureSnapshot(): Promise<PublicationSnapshot> {
  return PublicationSnapshotSchema.parse(
    JSON.parse(
      await readFile(
        join(repositoryRoot, "site/data/publication.json"),
        "utf8",
      ),
    ),
  );
}

describe("PocketBase publication parity", () => {
  it("projects the committed fixture corpus to the expected public routes", async () => {
    const projection = publicProjection(await fixtureSnapshot());

    expect(projection).toMatchObject({
      home: { title: "Anna Noelle" },
      resume: { title: "Résumé", mimeType: "application/pdf" },
      entries: [
        {
          title: "Publication Compiler",
          slug: "project-one",
          route: "/project-one",
          type: "project",
          pinOrder: 2,
        },
        {
          title: "Search as Navigation",
          slug: "writing-one",
          route: "/writing-one",
          type: "writing",
          pinOrder: 1,
        },
      ],
      pins: [
        { route: "/writing-one", pinOrder: 1 },
        { route: "/project-one", pinOrder: 2 },
      ],
    });
    expect(JSON.stringify(projection)).not.toContain("draft-only-canary");
  });

  const liveTest =
    process.env.PORTFOLIO_POCKETBASE_INTEGRATION === "1" ? it : it.skip;
  liveTest(
    "matches the fixture projection when live integration is explicitly enabled",
    async () => {
      const source = await createPocketBaseSource(
        readPocketBaseEnvironment(process.env),
      );
      const outputDirectory = await mkdtemp(
        join(tmpdir(), "portfolio-pocketbase-parity-"),
      );
      temporaryDirectories.push(outputDirectory);
      const live = await buildPublicationSnapshot(
        await source.listSourceRecords(),
        {
          outputDirectory: join(outputDirectory, "publication"),
          generatedAt: new Date().toISOString(),
          siteOrigin: "https://neffigie.dev",
          compilerVersion: PUBLISHER_VERSION,
          contentPipelineVersion: CONTENT_PIPELINE_VERSION,
          assetFetcher: source.assetFetcher,
          resolveMediaSource: source.resolveMediaSource,
        },
      );

      expect(publicProjection(live.snapshot)).toEqual(
        publicProjection(await fixtureSnapshot()),
      );
    },
  );
});
