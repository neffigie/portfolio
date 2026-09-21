import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import sharp from "sharp";
import { afterEach, describe, expect, it } from "vitest";

import {
  type ArtifactSink,
  type AssetFetcher,
  DiagnosticCollector,
  MediaResolver,
  type SourceAsset,
} from "../../src/index.js";

class DirectorySink implements ArtifactSink {
  constructor(readonly root: string) {}

  async writeAtomic(path: string, bytes: Uint8Array): Promise<void> {
    const destination = join(this.root, path);
    const partial = `${destination}.partial`;
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(partial, bytes);
    await rename(partial, destination);
  }
}

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((path) => rm(path, { recursive: true, force: true })),
  );
});

async function temporarySink(): Promise<DirectorySink> {
  const root = await mkdtemp(join(tmpdir(), "portfolio-media-"));
  temporaryDirectories.push(root);
  return new DirectorySink(root);
}

const landscapeAsset: SourceAsset = {
  kind: "pocketbase-file",
  recordId: "landscape-record",
  collectionId: "entries",
  fileName: "landscape.png",
};

const portraitAsset: SourceAsset = {
  kind: "pocketbase-file",
  recordId: "portrait-record",
  collectionId: "entries",
  fileName: "portrait.jpg",
};

async function fixture(name: string): Promise<Buffer> {
  return readFile(
    new URL(`../../../../fixtures/media/${name}`, import.meta.url),
  );
}

function createFetcher(): AssetFetcher & { calls: SourceAsset[] } {
  const calls: SourceAsset[] = [];
  return {
    calls,
    async fetch(asset) {
      calls.push(asset);
      const isPng = asset.fileName.endsWith(".png");
      return {
        bytes: await fixture(asset.fileName),
        mimeType: isPng ? "image/png" : "image/jpeg",
        originalName: asset.fileName,
      };
    },
  };
}

async function artifactFiles(root: string): Promise<string[]> {
  return (await readdir(root, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name).slice(root.length + 1))
    .sort();
}

describe("MediaResolver", () => {
  it("writes deterministic content-addressed fallback and WebP variants", async () => {
    const sink = await temporarySink();
    const diagnostics = new DiagnosticCollector();
    const resolver = new MediaResolver({
      fetcher: createFetcher(),
      sink,
      diagnostics,
    });

    const resolved = await resolver.resolve(landscapeAsset, "entry-1");

    expect(resolved.hash).toMatch(/^[0-9a-f]{64}$/u);
    expect(resolved).toMatchObject({
      mimeType: "image/png",
      width: 1200,
      height: 800,
      fallbackPath: `/assets/media/${resolved.hash}/original.png`,
    });
    expect(resolved.variants.map(({ width }) => width)).toEqual([480, 960]);
    expect(resolved.variants.map(({ path }) => path)).toEqual([
      `/assets/media/${resolved.hash}/480.webp`,
      `/assets/media/${resolved.hash}/960.webp`,
    ]);
    expect(await artifactFiles(sink.root)).toEqual([
      `assets/media/${resolved.hash}/480.webp`,
      `assets/media/${resolved.hash}/960.webp`,
      `assets/media/${resolved.hash}/original.png`,
    ]);
    expect(diagnostics.items).toEqual([]);

    for (const variant of resolved.variants) {
      const metadata = await sharp(
        join(sink.root, variant.path.slice(1)),
      ).metadata();
      expect(metadata.width).toBe(variant.width);
      expect(metadata.height).toBe(variant.height);
    }
  });

  it("auto-orients the fallback and does not enlarge portrait media", async () => {
    const sink = await temporarySink();
    const resolver = new MediaResolver({
      fetcher: createFetcher(),
      sink,
      diagnostics: new DiagnosticCollector(),
    });

    const resolved = await resolver.resolve(portraitAsset, "entry-portrait");
    const fallback = await sharp(
      join(sink.root, resolved.fallbackPath.slice(1)),
    ).metadata();

    expect(resolved.width).toBe(600);
    expect(resolved.height).toBe(900);
    expect(resolved.variants.map(({ width }) => width)).toEqual([480]);
    expect(fallback).toMatchObject({ width: 600, height: 900 });
    expect(fallback.orientation).toBeUndefined();
  });

  it("deduplicates a repeated source and accumulates sorted owners", async () => {
    const sink = await temporarySink();
    const fetcher = createFetcher();
    const resolver = new MediaResolver({
      fetcher,
      sink,
      diagnostics: new DiagnosticCollector(),
    });

    const first = await resolver.resolve(landscapeAsset, "z-owner");
    const second = await resolver.resolve(landscapeAsset, "a-owner");

    expect(second.hash).toBe(first.hash);
    expect(fetcher.calls).toHaveLength(1);
    expect(resolver.manifest()).toMatchObject([
      { hash: first.hash, ownerIds: ["a-owner", "z-owner"] },
    ]);
    expect(await artifactFiles(sink.root)).toHaveLength(3);
  });

  it("deduplicates different sources containing the same bytes", async () => {
    const sink = await temporarySink();
    const fetcher = createFetcher();
    const resolver = new MediaResolver({
      fetcher,
      sink,
      diagnostics: new DiagnosticCollector(),
    });
    const alias = { ...landscapeAsset, recordId: "alias-record" };

    const first = await resolver.resolve(landscapeAsset, "first");
    const second = await resolver.resolve(alias, "second");

    expect(first.hash).toBe(second.hash);
    expect(fetcher.calls).toHaveLength(2);
    expect(resolver.manifest()).toHaveLength(1);
  });

  it("decodes data URI media without calling the asset fetcher", async () => {
    const sink = await temporarySink();
    const fetcher = createFetcher();
    const resolver = new MediaResolver({
      fetcher,
      sink,
      diagnostics: new DiagnosticCollector(),
    });
    const bytes = await fixture("landscape.png");

    const resolved = await resolver.resolve(
      {
        kind: "data-uri",
        uri: `data:image/png;base64,${bytes.toString("base64")}`,
        originalName: "embedded.png",
      },
      "embedded-owner",
    );

    expect(resolved.width).toBe(1200);
    expect(fetcher.calls).toEqual([]);
  });

  it("produces byte-identical artifacts across independent runs", async () => {
    const firstSink = await temporarySink();
    const secondSink = await temporarySink();
    const first = new MediaResolver({
      fetcher: createFetcher(),
      sink: firstSink,
      diagnostics: new DiagnosticCollector(),
    });
    const second = new MediaResolver({
      fetcher: createFetcher(),
      sink: secondSink,
      diagnostics: new DiagnosticCollector(),
    });

    const firstResolved = await first.resolve(landscapeAsset, "entry-1");
    const secondResolved = await second.resolve(landscapeAsset, "entry-1");

    expect(secondResolved).toEqual(firstResolved);
    for (const path of await artifactFiles(firstSink.root)) {
      expect(await readFile(join(secondSink.root, path))).toEqual(
        await readFile(join(firstSink.root, path)),
      );
    }
  });

  it("rejects MIME mismatches and records a stable diagnostic", async () => {
    const diagnostics = new DiagnosticCollector();
    const sink = await temporarySink();
    const resolver = new MediaResolver({
      sink,
      diagnostics,
      fetcher: {
        async fetch() {
          return {
            bytes: await fixture("portrait.jpg"),
            mimeType: "image/png",
            originalName: "wrong.png",
          };
        },
      },
    });

    await expect(resolver.resolve(landscapeAsset, "entry-1")).rejects.toThrow(
      /MIME/iu,
    );
    expect(diagnostics.items).toMatchObject([
      { severity: "error", code: "media.mime-mismatch" },
    ]);
  });

  it("rejects empty fetched assets", async () => {
    const diagnostics = new DiagnosticCollector();
    const resolver = new MediaResolver({
      sink: await temporarySink(),
      diagnostics,
      fetcher: {
        async fetch() {
          return {
            bytes: new Uint8Array(),
            mimeType: "image/png",
            originalName: "empty.png",
          };
        },
      },
    });

    await expect(resolver.resolve(landscapeAsset, "entry-1")).rejects.toThrow(
      /empty/iu,
    );
    expect(diagnostics.items).toMatchObject([
      { severity: "error", code: "media.empty-asset" },
    ]);
  });

  it("preserves the stable unsupported-type code for data URI media", async () => {
    const diagnostics = new DiagnosticCollector();
    const resolver = new MediaResolver({
      sink: await temporarySink(),
      diagnostics,
      fetcher: createFetcher(),
    });

    await expect(
      resolver.resolve(
        {
          kind: "data-uri",
          uri: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
          originalName: "unsupported.gif",
        },
        "entry-1",
      ),
    ).rejects.toThrow(/unsupported/iu);
    expect(diagnostics.items).toMatchObject([
      { severity: "error", code: "media.unsupported-type" },
    ]);
  });
});
