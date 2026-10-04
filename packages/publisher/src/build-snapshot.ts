import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { DirectoryArtifactSink } from "./artifacts/directory-sink.js";
import { StagedPublicationDirectory } from "./artifacts/publish-directory.js";
import { canonicalStringify, sourceRevisionFingerprint } from "./canonical.js";
import { compileEntry } from "./compile-entry.js";
import { detectCorpusLanguages } from "./compiler/code-languages.js";
import { compileDocument } from "./compiler/processor.js";
import { createContentPlugins } from "./compiler/registry.js";
import {
  CompilationFailure,
  type Diagnostic,
  DiagnosticCollector,
} from "./diagnostics.js";
import { ResolvingMediaCollector } from "./media/request-collector.js";
import { MediaResolver } from "./media/resolver.js";
import type { AssetFetcher, MediaSourceResolver } from "./media/types.js";
import {
  type NormalizedEntry,
  type PublicationSnapshot,
  PublicationSnapshotSchema,
  type ReservedContent,
  type SourceRecord,
} from "./model.js";
import { normalizeRecords } from "./normalize.js";
import { publishResumeAsset } from "./resume-asset.js";
import { assembleSnapshot } from "./snapshot.js";

export interface BuildPublicationDependencies {
  outputDirectory: string;
  generatedAt: string;
  siteOrigin: string;
  compilerVersion: string;
  contentPipelineVersion: number;
  assetFetcher: AssetFetcher;
  resolveMediaSource: MediaSourceResolver;
}

export interface PublicationArtifacts {
  snapshot: PublicationSnapshot;
  mediaWrites: string[];
  diagnostics: readonly Diagnostic[];
}

function utf8(value: string): Uint8Array {
  return Buffer.from(value, "utf8");
}

function json(value: unknown): Uint8Array {
  return utf8(`${JSON.stringify(value, null, 2)}\n`);
}

function requiredReserved(
  entry: NormalizedEntry | null,
  slug: "home" | "resume",
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
  const publicationDirectory = await StagedPublicationDirectory.create(
    dependencies.outputDirectory,
  );
  const partialDirectory = publicationDirectory.path;
  const diagnostics = new DiagnosticCollector();

  try {
    const sink = new DirectoryArtifactSink(partialDirectory);
    const corpus = normalizeRecords(records, diagnostics);
    diagnostics.throwIfErrors();

    const home = requiredReserved(corpus.home, "home");
    const resume = requiredReserved(corpus.resume, "resume");
    const revisionFingerprint = sourceRevisionFingerprint(records);
    const languages = detectCorpusLanguages([
      home.bodyHtml,
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
        html: document.html,
        updated: entry.updated,
      };
    };

    const compiledHome = await compileReserved(home);
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

    await publicationDirectory.commit();
    return {
      snapshot: snapshotReadback,
      mediaWrites: sink.writes
        .filter((path) => path.startsWith("assets/media/"))
        .sort(),
      diagnostics: diagnostics.items,
    };
  } catch (error) {
    await publicationDirectory.discard();
    if (diagnostics.hasErrors && !(error instanceof CompilationFailure)) {
      diagnostics.throwIfErrors();
    }
    throw error;
  }
}
