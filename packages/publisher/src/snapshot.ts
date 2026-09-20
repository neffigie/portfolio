import { canonicalStringify, sha256 } from "./canonical.js";
import {
  type CompiledEntry,
  type MediaManifestEntry,
  type PublicationSnapshot,
  PublicationSnapshotSchema,
  type ReservedContent,
  type ReservedResume,
} from "./model.js";
import { CONTRACT_VERSION } from "./version.js";

export interface SnapshotInput {
  sourceRevisionFingerprint: string;
  generatedAt: string;
  reserved: {
    home: ReservedContent;
    about: ReservedContent;
    resume: ReservedResume;
  };
  entries: readonly CompiledEntry[];
  media: readonly MediaManifestEntry[];
  compiler: {
    version: string;
    contentPipelineVersion: number;
  };
}

function compareText(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

function compareEntries(left: CompiledEntry, right: CompiledEntry): number {
  const dateComparison = compareText(right.date, left.date);
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
  const withoutReservedUpdates = {
    home: {
      sourceId: snapshot.reserved.home.sourceId,
      title: snapshot.reserved.home.title,
      summary: snapshot.reserved.home.summary,
      html: snapshot.reserved.home.html,
    },
    about: {
      sourceId: snapshot.reserved.about.sourceId,
      title: snapshot.reserved.about.title,
      summary: snapshot.reserved.about.summary,
      html: snapshot.reserved.about.html,
    },
    resume: {
      sourceId: snapshot.reserved.resume.sourceId,
      title: snapshot.reserved.resume.title,
      summary: snapshot.reserved.resume.summary,
      html: snapshot.reserved.resume.html,
      asset: snapshot.reserved.resume.asset,
    },
  };
  const entries = snapshot.entries.map(
    ({
      sourceRevisionFingerprint: _sourceRevision,
      updated: _updated,
      ...entry
    }) => entry,
  );

  return {
    schemaVersion: snapshot.schemaVersion,
    reserved: withoutReservedUpdates,
    entries,
    pins: snapshot.pins,
    media: snapshot.media,
    compiler: snapshot.compiler,
  };
}

export function assembleSnapshot(input: SnapshotInput): PublicationSnapshot {
  const entries = [...input.entries].sort(compareEntries);
  const pins = entries
    .filter(
      (entry): entry is CompiledEntry & { pinOrder: number } =>
        entry.pinOrder !== null,
    )
    .map(({ sourceId, route, pinOrder }) => ({ sourceId, route, pinOrder }))
    .sort(
      (left, right) =>
        left.pinOrder - right.pinOrder || compareText(left.route, right.route),
    );
  const candidate = PublicationSnapshotSchema.parse({
    schemaVersion: CONTRACT_VERSION,
    sourceRevisionFingerprint: input.sourceRevisionFingerprint,
    fullContentFingerprint: "0".repeat(64),
    generatedAt: input.generatedAt,
    reserved: input.reserved,
    entries,
    pins,
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
