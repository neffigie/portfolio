import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import {
  basename,
  dirname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";

import {
  canonicalStringify,
  sha256,
  sourceRevisionFingerprint,
} from "./canonical.js";
import { compileEntry } from "./compile-entry.js";
import { detectCorpusLanguages } from "./compiler/code-languages.js";
import { compileDocument } from "./compiler/processor.js";
import { createContentPlugins } from "./compiler/registry.js";
import type { MediaRequest, MediaRequestCollector } from "./compiler/types.js";
import {
  CompilationFailure,
  type Diagnostic,
  DiagnosticCollector,
} from "./diagnostics.js";
import { MediaResolver } from "./media/resolver.js";
import type {
  ArtifactSink,
  AssetFetcher,
  FetchedAsset,
  MediaSource,
} from "./media/types.js";
import {
  type NormalizedEntry,
  type PublicationSnapshot,
  PublicationSnapshotSchema,
  type PublishedAsset,
  PublishedAssetSchema,
  type ReservedContent,
  type SourceAsset,
  type SourceRecord,
} from "./model.js";
import { normalizeRecords } from "./normalize.js";
import { assembleSnapshot } from "./snapshot.js";

export interface BuildPublicationDependencies {
  outputDirectory: string;
  generatedAt: string;
  siteOrigin: string;
  compilerVersion: string;
  contentPipelineVersion: number;
  assetFetcher: AssetFetcher;
  resolveMediaSource(source: string, ownerId: string): MediaSource;
}

export interface PublicationArtifacts {
  snapshot: PublicationSnapshot;
  mediaWrites: string[];
  diagnostics: readonly Diagnostic[];
}

class DirectoryArtifactSink implements ArtifactSink {
  readonly writes: string[] = [];
  #writeCounter = 0;

  constructor(readonly root: string) {}

  async writeAtomic(path: string, bytes: Uint8Array): Promise<void> {
    if (isAbsolute(path)) {
      throw new TypeError("Artifact paths must be relative.");
    }
    const destination = resolve(this.root, path);
    const fromRoot = relative(this.root, destination);
    if (fromRoot === ".." || fromRoot.startsWith(`..${sep}`)) {
      throw new TypeError("Artifact paths cannot escape the output directory.");
    }

    await mkdir(dirname(destination), { recursive: true });
    const partial = `${destination}.partial-${process.pid}-${this.#writeCounter}`;
    this.#writeCounter += 1;
    await writeFile(partial, bytes);
    await rename(partial, destination);
    this.writes.push(path);
  }
}

class ResolvingMediaCollector implements MediaRequestCollector {
  readonly #sources = new Map<string, string>();
  readonly #resolutions = new Map<
    string,
    ReturnType<MediaResolver["resolve"]>
  >();
  #nextRequest = 1;

  constructor(
    readonly ownerId: string,
    readonly resolver: MediaResolver,
    readonly sourceResolver: BuildPublicationDependencies["resolveMediaSource"],
    readonly diagnostics: DiagnosticCollector,
  ) {}

  request(request: MediaRequest): string {
    const requestId = `media-${this.#nextRequest}`;
    this.#nextRequest += 1;
    this.#sources.set(requestId, request.source);
    return requestId;
  }

  resolve(requestId: string): ReturnType<MediaResolver["resolve"]> {
    const existing = this.#resolutions.get(requestId);
    if (existing !== undefined) {
      return existing;
    }
    const source = this.#sources.get(requestId);
    if (source === undefined) {
      return Promise.reject(
        new TypeError(`Unknown media request ${JSON.stringify(requestId)}.`),
      );
    }

    let resolvedSource: MediaSource;
    try {
      resolvedSource = this.sourceResolver(source, this.ownerId);
    } catch (error) {
      this.diagnostics.error({
        category: "media",
        code: "media.source-invalid",
        message: `Could not interpret media source: ${String(error)}`,
        recordId: this.ownerId,
        stage: "media-resolution",
      });
      return Promise.reject(error);
    }
    const pending = this.resolver.resolve(resolvedSource, this.ownerId);
    this.#resolutions.set(requestId, pending);
    return pending;
  }

  requestIds(): readonly string[] {
    return [...this.#sources.keys()];
  }
}

function utf8(value: string): Uint8Array {
  return Buffer.from(value, "utf8");
}

function json(value: unknown): Uint8Array {
  return utf8(`${JSON.stringify(value, null, 2)}\n`);
}

async function publishResumeAsset(
  asset: SourceAsset,
  fetcher: AssetFetcher,
  sink: ArtifactSink,
  diagnostics: DiagnosticCollector,
  recordId: string,
): Promise<PublishedAsset> {
  let fetched: FetchedAsset;
  try {
    fetched = await fetcher.fetch(asset);
  } catch (error) {
    diagnostics.error({
      category: "publication",
      code: "publication.resume-unavailable",
      message: `Could not load the résumé asset: ${String(error)}`,
      recordId,
      stage: "resume-publication",
    });
    throw error;
  }

  const isPdf = fetched.mimeType.toLowerCase() === "application/pdf";
  const hasPdfSignature =
    Buffer.from(fetched.bytes.subarray(0, 5)).toString("ascii") === "%PDF-";
  if (fetched.bytes.byteLength === 0 || !isPdf || !hasPdfSignature) {
    diagnostics.error({
      category: "publication",
      code: "publication.invalid-resume",
      message: "The résumé asset must be a non-empty PDF.",
      recordId,
      stage: "resume-publication",
    });
    throw new TypeError("Invalid résumé asset.");
  }

  const hash = sha256(fetched.bytes);
  const fileName = basename(fetched.originalName);
  const path = `assets/resume/${hash}/${fileName}`;
  await sink.writeAtomic(path, fetched.bytes);
  return PublishedAssetSchema.parse({
    hash,
    path: `/${path}`,
    fileName,
    mimeType: "application/pdf",
  });
}

function requiredReserved(
  entry: NormalizedEntry | null,
  slug: "home" | "about" | "resume",
): NormalizedEntry {
  if (entry === null) {
    throw new TypeError(`Missing normalized reserved ${slug} entry.`);
  }
  return entry;
}

export async function buildPublicationSnapshot(
  records: readonly SourceRecord[],
  dependencies: BuildPublicationDependencies,
): Promise<PublicationArtifacts> {
  const outputDirectory = resolve(dependencies.outputDirectory);
  const partialDirectory = `${outputDirectory}.partial-${process.pid}`;
  const diagnostics = new DiagnosticCollector();
  let partialCreated = false;

  try {
    await mkdir(dirname(outputDirectory), { recursive: true });
    await mkdir(partialDirectory);
    partialCreated = true;
    const sink = new DirectoryArtifactSink(partialDirectory);
    const corpus = normalizeRecords(records, diagnostics);
    diagnostics.throwIfErrors();

    const home = requiredReserved(corpus.home, "home");
    const about = requiredReserved(corpus.about, "about");
    const resume = requiredReserved(corpus.resume, "resume");
    const revisionFingerprint = sourceRevisionFingerprint(records);
    const languages = detectCorpusLanguages([
      home.bodyHtml,
      about.bodyHtml,
      resume.bodyHtml,
      ...corpus.entries.map(({ bodyHtml }) => bodyHtml),
    ]);
    const plugins = createContentPlugins(languages);
    const mediaResolver = new MediaResolver({
      fetcher: dependencies.assetFetcher,
      sink,
      diagnostics,
    });
    const collector = (entry: NormalizedEntry) =>
      new ResolvingMediaCollector(
        entry.sourceId,
        mediaResolver,
        dependencies.resolveMediaSource,
        diagnostics,
      );
    const compileReserved = async (
      entry: NormalizedEntry,
    ): Promise<ReservedContent> => {
      const document = await compileDocument(
        entry.bodyHtml,
        {
          recordId: entry.sourceId,
          route: entry.route ?? "/",
          siteOrigin: dependencies.siteOrigin,
          diagnostics,
          media: collector(entry),
        },
        plugins,
      );
      return {
        sourceId: entry.sourceId,
        title: entry.title,
        summary: entry.summary,
        html: document.html,
        updated: entry.updated,
      };
    };

    const compiledHome = await compileReserved(home);
    const compiledAbout = await compileReserved(about);
    const compiledResume = await compileReserved(resume);
    if (resume.asset === null) {
      throw new TypeError("Normalized résumé has no asset.");
    }
    const resumeAsset = await publishResumeAsset(
      resume.asset,
      dependencies.assetFetcher,
      sink,
      diagnostics,
      resume.sourceId,
    );
    const entries = [];
    for (const entry of corpus.entries) {
      entries.push(
        await compileEntry(entry, {
          sourceRevisionFingerprint: revisionFingerprint,
          siteOrigin: dependencies.siteOrigin,
          diagnostics,
          media: collector(entry),
          plugins,
        }),
      );
    }
    diagnostics.throwIfErrors();

    const snapshot = assembleSnapshot({
      sourceRevisionFingerprint: revisionFingerprint,
      generatedAt: dependencies.generatedAt,
      reserved: {
        home: compiledHome,
        about: compiledAbout,
        resume: { ...compiledResume, asset: resumeAsset },
      },
      entries,
      media: mediaResolver.manifest(),
      compiler: {
        version: dependencies.compilerVersion,
        contentPipelineVersion: dependencies.contentPipelineVersion,
      },
    });
    await sink.writeAtomic("snapshot.json", json(snapshot));
    await sink.writeAtomic("diagnostics.json", json(diagnostics.items));

    const snapshotReadback = PublicationSnapshotSchema.parse(
      JSON.parse(
        await readFile(resolve(partialDirectory, "snapshot.json"), "utf8"),
      ),
    );
    if (canonicalStringify(snapshotReadback) !== canonicalStringify(snapshot)) {
      throw new TypeError("Snapshot readback did not match emitted content.");
    }

    await rename(partialDirectory, outputDirectory);
    partialCreated = false;
    return {
      snapshot: snapshotReadback,
      mediaWrites: sink.writes
        .filter((path) => path.startsWith("assets/media/"))
        .sort(),
      diagnostics: diagnostics.items,
    };
  } catch (error) {
    if (partialCreated) {
      await rm(partialDirectory, { recursive: true, force: true });
    }
    if (diagnostics.hasErrors && !(error instanceof CompilationFailure)) {
      diagnostics.throwIfErrors();
    }
    throw error;
  }
}
