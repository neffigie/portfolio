import { canonicalStringify, sha256 } from "./canonical.js";
import { compileDocument } from "./compiler/processor.js";
import type { ContentPlugin, MediaRequestCollector } from "./compiler/types.js";
import type { DiagnosticCollector } from "./diagnostics.js";
import {
  type NormalizedEntry,
  type Post,
  type PostKind,
  PostSchema,
  type PublishedAsset,
} from "./model.js";
import type { ReservedSlug } from "./routes.js";

export interface CompilePostDependencies {
  sourceRevisionFingerprint: string;
  siteOrigin: string;
  diagnostics: DiagnosticCollector;
  media: MediaRequestCollector;
  plugins: readonly ContentPlugin[];
}

function postKind(entry: NormalizedEntry): PostKind {
  if (entry.classification === "reserved") {
    return entry.slug as ReservedSlug;
  }
  if (entry.classification === "published" && entry.type !== null) {
    return entry.type;
  }
  throw new TypeError(
    `Cannot compile record ${JSON.stringify(entry.sourceId)} as a post.`,
  );
}

export async function compilePost(
  entry: NormalizedEntry,
  dependencies: CompilePostDependencies,
  asset: PublishedAsset | null = null,
): Promise<Post> {
  const kind = postKind(entry);
  if (entry.route === null) {
    throw new TypeError(
      `Cannot compile record ${JSON.stringify(entry.sourceId)} without a route.`,
    );
  }
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
  const content = {
    sourceId: entry.sourceId,
    kind,
    title: entry.title,
    slug: entry.slug,
    route: entry.route,
    previewText: document.previewText,
    tags: entry.tags,
    date: entry.date,
    pinOrder: kind === "home" || kind === "resume" ? null : entry.pinOrder,
    html: document.html,
    searchableText: document.searchableText,
    asset,
    mediaHashes: [...new Set(resolvedMedia.map(({ hash }) => hash))].sort(),
  };

  return PostSchema.parse({
    ...content,
    updated: entry.updated,
    contentFingerprint: sha256(canonicalStringify(content)),
    sourceRevisionFingerprint: dependencies.sourceRevisionFingerprint,
  });
}
