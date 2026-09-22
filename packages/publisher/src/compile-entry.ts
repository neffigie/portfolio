import { canonicalStringify, sha256 } from "./canonical.js";
import { compileDocument } from "./compiler/processor.js";
import type { ContentPlugin, MediaRequestCollector } from "./compiler/types.js";
import type { DiagnosticCollector } from "./diagnostics.js";
import {
  type CompiledEntry,
  CompiledEntrySchema,
  type NormalizedEntry,
} from "./model.js";

export interface CompileEntryDependencies {
  sourceRevisionFingerprint: string;
  siteOrigin: string;
  diagnostics: DiagnosticCollector;
  media: MediaRequestCollector;
  plugins: readonly ContentPlugin[];
}

function assertPublishedEntry(
  entry: NormalizedEntry,
): asserts entry is NormalizedEntry & {
  route: string;
  type: "writing" | "project";
  date: string;
} {
  if (
    entry.classification !== "published" ||
    entry.route === null ||
    entry.type === null ||
    entry.date === null
  ) {
    throw new TypeError(
      `Cannot compile record ${JSON.stringify(entry.sourceId)} as a published entry.`,
    );
  }
}

export async function compileEntry(
  entry: NormalizedEntry,
  dependencies: CompileEntryDependencies,
): Promise<CompiledEntry> {
  assertPublishedEntry(entry);
  const document = await compileDocument(
    entry.bodyHtml,
    {
      recordId: entry.sourceId,
      route: entry.route,
      siteOrigin: dependencies.siteOrigin,
      diagnostics: dependencies.diagnostics,
      media: dependencies.media,
    },
    dependencies.plugins,
  );
  const resolvedMedia = await Promise.all(
    document.mediaRequestIds.map((requestId) =>
      dependencies.media.resolve(requestId),
    ),
  );
  const mediaHashes = [
    ...new Set(resolvedMedia.map(({ hash }) => hash)),
  ].sort();
  const entryContentFingerprint = sha256(
    canonicalStringify({
      title: entry.title,
      slug: entry.slug,
      route: entry.route,
      previewText: document.previewText,
      type: entry.type,
      tags: entry.tags,
      date: entry.date,
      pinOrder: entry.pinOrder,
      html: document.html,
      searchableText: document.searchableText,
      mediaHashes,
    }),
  );

  return CompiledEntrySchema.parse({
    sourceId: entry.sourceId,
    title: entry.title,
    slug: entry.slug,
    route: entry.route,
    previewText: document.previewText,
    type: entry.type,
    tags: entry.tags,
    date: entry.date,
    updated: entry.updated,
    pinOrder: entry.pinOrder,
    html: document.html,
    searchableText: document.searchableText,
    mediaHashes,
    entryContentFingerprint,
    sourceRevisionFingerprint: dependencies.sourceRevisionFingerprint,
  });
}
