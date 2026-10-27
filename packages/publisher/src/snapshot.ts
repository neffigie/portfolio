import { canonicalStringify, sha256 } from "./canonical.js";
import {
  isListedPostKind,
  type MediaManifestEntry,
  type Post,
  type PublicationSnapshot,
  PublicationSnapshotSchema,
} from "./model.js";
import { compareText } from "./ordering.js";
import { CONTRACT_VERSION } from "./version.js";

export interface SnapshotInput {
  sourceRevisionFingerprint: string;
  generatedAt: string;
  posts: readonly Post[];
  media: readonly MediaManifestEntry[];
  compiler: {
    version: string;
    contentPipelineVersion: number;
  };
}

const specialKindOrder = { home: 0, resume: 1 } as const;

function comparePosts(left: Post, right: Post): number {
  const leftListed = isListedPostKind(left.kind);
  const rightListed = isListedPostKind(right.kind);
  if (!leftListed || !rightListed) {
    if (leftListed !== rightListed) return leftListed ? 1 : -1;
    return (
      specialKindOrder[left.kind as keyof typeof specialKindOrder] -
      specialKindOrder[right.kind as keyof typeof specialKindOrder]
    );
  }
  const dateComparison = compareText(right.date ?? "", left.date ?? "");
  return dateComparison === 0
    ? compareText(left.slug, right.slug)
    : dateComparison;
}

function normalizeMedia(
  media: readonly MediaManifestEntry[],
): MediaManifestEntry[] {
  return media
    .map((entry) => ({
      ...entry,
      ownerIds: [...entry.ownerIds].sort(compareText),
      variants: [...entry.variants].sort(
        (left, right) =>
          left.width - right.width || compareText(left.path, right.path),
      ),
    }))
    .sort((left, right) => compareText(left.hash, right.hash));
}

function contentIdentityMaterial(snapshot: PublicationSnapshot): unknown {
  return {
    schemaVersion: snapshot.schemaVersion,
    posts: snapshot.posts.map(
      ({
        sourceRevisionFingerprint: _sourceRevision,
        updated: _updated,
        ...post
      }) => post,
    ),
    media: snapshot.media,
    compiler: snapshot.compiler,
  };
}

export function assembleSnapshot(input: SnapshotInput): PublicationSnapshot {
  const candidate = PublicationSnapshotSchema.parse({
    schemaVersion: CONTRACT_VERSION,
    sourceRevisionFingerprint: input.sourceRevisionFingerprint,
    fullContentFingerprint: "0".repeat(64),
    generatedAt: input.generatedAt,
    posts: [...input.posts].sort(comparePosts),
    media: normalizeMedia(input.media),
    compiler: {
      name: "@portfolio/publisher",
      version: input.compiler.version,
      contentPipelineVersion: input.compiler.contentPipelineVersion,
    },
  });
  const fullContentFingerprint = sha256(
    canonicalStringify(contentIdentityMaterial(candidate)),
  );

  return PublicationSnapshotSchema.parse({
    ...candidate,
    fullContentFingerprint,
  });
}
