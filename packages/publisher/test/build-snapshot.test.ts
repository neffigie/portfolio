import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  type BuildPublicationDependencies,
  buildPublicationSnapshot,
  CompilationFailure,
  type FetchedAsset,
  type MediaSource,
  type SourceAsset,
  type SourceRecord,
} from "../src/index.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((path) => rm(path, { recursive: true, force: true })),
  );
});

async function temporaryOutput(name: string): Promise<string> {
  const parent = await mkdtemp(join(tmpdir(), "portfolio-publication-"));
  temporaryDirectories.push(parent);
  return join(parent, name);
}

function record(
  id: string,
  overrides: Partial<SourceRecord> = {},
): SourceRecord {
  return {
    id,
    title: id,
    slug: id,
    bodyHtml: `<p>${id} body</p>`,
    type: "writing",
    tags: [],
    date: "2026-09-20",
    pinOrder: null,
    asset: null,
    created: "2026-09-01T12:00:00.000Z",
    updated: "2026-09-20T12:00:00.000Z",
    ...overrides,
  };
}

async function fixture(name: string): Promise<Buffer> {
  return readFile(new URL(`../../../fixtures/media/${name}`, import.meta.url));
}

async function corpus(): Promise<SourceRecord[]> {
  const image = (await fixture("landscape.png")).toString("base64");
  return [
    record("home-id", {
      title: "Anna Noelle",
      slug: "home",
      bodyHtml:
        "<h1>Anna Noelle</h1><p>Selected work and writing. I build durable systems.</p>",
      type: null,
      date: null,
    }),
    record("resume-id", {
      title: "Résumé",
      slug: "resume",
      bodyHtml: "",
      type: null,
      date: null,
      asset: {
        kind: "pocketbase-file",
        recordId: "resume-id",
        collectionId: "entries",
        fileName: "anna-noelle-resume.pdf",
      },
    }),
    record("project-id", {
      title: "Project One",
      slug: "project-one",
      type: "project",
      date: "2026-09-20",
      pinOrder: 2,
      bodyHtml: `<figure><img src="data:image/png;base64,${image}" alt="System diagram"><figcaption>System diagram</figcaption></figure>`,
      tags: ["Systems"],
    }),
    record("writing-id", {
      title: "Writing One",
      slug: "writing-one",
      type: "writing",
      date: "2026-08-20",
      pinOrder: 1,
      bodyHtml: `<h2>One idea</h2><pre><code class="language-ts">const durable = true;</code></pre><img src="data:image/png;base64,${image}" alt="The same system diagram">`,
      tags: ["TypeScript"],
    }),
    record("draft-id", {
      slug: "draft-notes",
      type: null,
      date: null,
    }),
  ];
}

function dependencies(outputDirectory: string): BuildPublicationDependencies {
  return {
    outputDirectory,
    generatedAt: "2026-09-20T15:00:00.000Z",
    siteOrigin: "https://neffigie.dev",
    compilerVersion: "0.0.0",
    contentPipelineVersion: 1,
    assetFetcher: {
      async fetch(asset: SourceAsset): Promise<FetchedAsset> {
        if (asset.fileName.endsWith(".pdf")) {
          return {
            bytes: Buffer.from("%PDF-1.7\nportfolio fixture\n", "utf8"),
            mimeType: "application/pdf",
            originalName: asset.fileName,
          };
        }
        return {
          bytes: await fixture(asset.fileName),
          mimeType: asset.fileName.endsWith(".png")
            ? "image/png"
            : "image/jpeg",
          originalName: asset.fileName,
        };
      },
    },
    resolveMediaSource(source: string, ownerId: string): MediaSource {
      if (source.startsWith("data:")) {
        return {
          kind: "data-uri",
          uri: source,
          originalName: `${ownerId}-embedded.png`,
        };
      }
      return {
        kind: "pocketbase-file",
        recordId: ownerId,
        collectionId: "entries",
        fileName: basename(source),
      };
    },
  };
}

async function files(root: string): Promise<string[]> {
  return (await readdir(root, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name).slice(root.length + 1))
    .sort();
}

describe("buildPublicationSnapshot", () => {
  it("emits one validated snapshot without raw source URLs or data images", async () => {
    const outputDirectory = await temporaryOutput("published");
    const artifacts = await buildPublicationSnapshot(
      await corpus(),
      dependencies(outputDirectory),
    );

    expect(artifacts.snapshot.entries.map(({ route }) => route)).toEqual([
      "/project-one",
      "/writing-one",
    ]);
    expect(artifacts.snapshot.pins.map(({ route }) => route)).toEqual([
      "/writing-one",
      "/project-one",
    ]);
    expect(artifacts.snapshot.reserved.resume.html).toBe("");
    expect(artifacts.snapshot.reserved.resume.asset.path).toMatch(
      /^\/assets\/resume\/[0-9a-f]{64}\/anna-noelle-resume\.pdf$/u,
    );
    expect(artifacts.diagnostics).toEqual([]);
    expect(artifacts.mediaWrites.length).toBeGreaterThan(0);
    expect(artifacts.snapshot.media).toHaveLength(1);
    expect(artifacts.snapshot.media[0]?.ownerIds).toEqual([
      "project-id",
      "writing-id",
    ]);
    expect(artifacts.snapshot.entries[0]?.mediaHashes).toEqual(
      artifacts.snapshot.entries[1]?.mediaHashes,
    );

    const snapshotJson = await readFile(
      join(outputDirectory, "snapshot.json"),
      "utf8",
    );
    expect(snapshotJson.toLowerCase()).not.toContain("pocketbase");
    expect(snapshotJson).not.toContain("data:image/");
    expect(await files(outputDirectory)).toEqual(
      expect.arrayContaining([
        "diagnostics.json",
        "snapshot.json",
        expect.stringMatching(/^assets\/media\//u),
        expect.stringMatching(/^assets\/resume\//u),
      ]),
    );
  });

  it("produces byte-identical output with a fixed clock", async () => {
    const firstDirectory = await temporaryOutput("repeat-a");
    const secondDirectory = await temporaryOutput("repeat-b");
    const records = await corpus();

    await buildPublicationSnapshot(records, dependencies(firstDirectory));
    await buildPublicationSnapshot(records, dependencies(secondDirectory));

    const firstFiles = await files(firstDirectory);
    const secondFiles = await files(secondDirectory);
    expect(secondFiles).toEqual(firstFiles);
    for (const path of firstFiles) {
      expect(await readFile(join(secondDirectory, path))).toEqual(
        await readFile(join(firstDirectory, path)),
      );
    }
  });

  it("replaces an existing publication after the new snapshot validates", async () => {
    const outputDirectory = await temporaryOutput("replace-existing");
    const records = await corpus();
    await buildPublicationSnapshot(records, dependencies(outputDirectory));

    const revised = records.map((entry) =>
      entry.id === "writing-id"
        ? {
            ...entry,
            title: "Revised Writing",
            updated: "2026-09-21T12:00:00.000Z",
          }
        : entry,
    );
    const artifacts = await buildPublicationSnapshot(
      revised,
      dependencies(outputDirectory),
    );

    expect(
      artifacts.snapshot.entries.find(
        ({ sourceId }) => sourceId === "writing-id",
      )?.title,
    ).toBe("Revised Writing");
    const written = JSON.parse(
      await readFile(join(outputDirectory, "snapshot.json"), "utf8"),
    ) as { entries: Array<{ sourceId: string; title: string }> };
    expect(
      written.entries.find(({ sourceId }) => sourceId === "writing-id")?.title,
    ).toBe("Revised Writing");
  });

  it("preserves the existing publication when its replacement fails", async () => {
    const outputDirectory = await temporaryOutput("preserve-existing");
    await buildPublicationSnapshot(
      await corpus(),
      dependencies(outputDirectory),
    );
    const previous = await readFile(join(outputDirectory, "snapshot.json"));

    await expect(
      buildPublicationSnapshot([], dependencies(outputDirectory)),
    ).rejects.toBeInstanceOf(CompilationFailure);

    expect(await readFile(join(outputDirectory, "snapshot.json"))).toEqual(
      previous,
    );
  });

  it("removes only its partial directory when validation fails", async () => {
    const outputDirectory = await temporaryOutput("invalid");

    await expect(
      buildPublicationSnapshot([], dependencies(outputDirectory)),
    ).rejects.toBeInstanceOf(CompilationFailure);
    await expect(readdir(outputDirectory)).rejects.toThrow();
    await expect(
      readdir(`${outputDirectory}.partial-${process.pid}`),
    ).rejects.toThrow();
  });

  it("fails publication when the required résumé asset is missing", async () => {
    const outputDirectory = await temporaryOutput("missing-resume");
    const records = (await corpus()).map((entry) =>
      entry.slug === "resume" ? { ...entry, asset: null } : entry,
    );

    await expect(
      buildPublicationSnapshot(records, dependencies(outputDirectory)),
    ).rejects.toMatchObject({
      diagnostics: expect.arrayContaining([
        expect.objectContaining({ code: "schema.reserved-field" }),
      ]),
    });
    await expect(readdir(outputDirectory)).rejects.toThrow();
  });
});
