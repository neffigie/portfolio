import { z } from "zod";

import { CONTRACT_VERSION } from "./version.js";

const fingerprintSchema = z.string().regex(/^[0-9a-f]{64}$/u);
const instantSchema = z.iso.datetime({ offset: true });

export const EntryTypeSchema = z.enum(["writing", "project"]);
export type EntryType = z.infer<typeof EntryTypeSchema>;

export const EntryClassificationSchema = z.enum([
  "published",
  "reserved",
  "draft",
]);
export type EntryClassification = z.infer<typeof EntryClassificationSchema>;

export const SourceAssetSchema = z.strictObject({
  kind: z.literal("pocketbase-file"),
  recordId: z.string().min(1),
  collectionId: z.string().min(1),
  fileName: z.string().min(1),
});
export type SourceAsset = z.infer<typeof SourceAssetSchema>;

export const SourceRecordSchema = z.strictObject({
  id: z.string().min(1),
  title: z.string(),
  slug: z.string(),
  summary: z.string(),
  bodyHtml: z.string(),
  type: EntryTypeSchema.nullable(),
  tags: z.array(z.string()),
  date: z.string().nullable(),
  pinOrder: z.number().int().positive().nullable(),
  asset: SourceAssetSchema.nullable(),
  created: z.string().min(1),
  updated: z.string().min(1),
});
export type SourceRecord = z.infer<typeof SourceRecordSchema>;

export const NormalizedTagSchema = z.strictObject({
  key: z.string().min(1),
  label: z.string().min(1),
});
export type NormalizedTag = z.infer<typeof NormalizedTagSchema>;

export const NormalizedEntrySchema = z.strictObject({
  sourceId: z.string().min(1),
  title: z.string(),
  slug: z.string(),
  route: z.string().nullable(),
  summary: z.string(),
  bodyHtml: z.string(),
  type: EntryTypeSchema.nullable(),
  tags: z.array(NormalizedTagSchema),
  date: instantSchema.nullable(),
  pinOrder: z.number().int().positive().nullable(),
  asset: SourceAssetSchema.nullable(),
  created: instantSchema,
  updated: instantSchema,
  classification: EntryClassificationSchema,
});
export type NormalizedEntry = z.infer<typeof NormalizedEntrySchema>;

export const MediaVariantSchema = z.strictObject({
  path: z.string().startsWith("/"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  mimeType: z.string().min(1),
});
export type MediaVariant = z.infer<typeof MediaVariantSchema>;

export const MediaManifestEntrySchema = z.strictObject({
  hash: fingerprintSchema,
  mimeType: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  fallbackPath: z.string().startsWith("/"),
  variants: z.array(MediaVariantSchema),
  ownerIds: z.array(z.string().min(1)),
});
export type MediaManifestEntry = z.infer<typeof MediaManifestEntrySchema>;

export const CompiledEntrySchema = z.strictObject({
  sourceId: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  route: z.string().startsWith("/"),
  summary: z.string().min(1),
  type: EntryTypeSchema,
  tags: z.array(NormalizedTagSchema),
  date: instantSchema,
  updated: instantSchema,
  pinOrder: z.number().int().positive().nullable(),
  html: z.string().min(1),
  searchableText: z.string(),
  mediaHashes: z.array(fingerprintSchema),
  entryContentFingerprint: fingerprintSchema,
  sourceRevisionFingerprint: fingerprintSchema,
});
export type CompiledEntry = z.infer<typeof CompiledEntrySchema>;

const reservedContentShape = {
  sourceId: z.string().min(1),
  title: z.string().min(1),
  summary: z.string(),
  html: z.string(),
  updated: instantSchema,
};

export const ReservedContentSchema = z.strictObject(reservedContentShape);
export type ReservedContent = z.infer<typeof ReservedContentSchema>;

export const PublishedAssetSchema = z.strictObject({
  hash: fingerprintSchema,
  path: z.string().startsWith("/"),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
});
export type PublishedAsset = z.infer<typeof PublishedAssetSchema>;

export const ReservedResumeSchema = z.strictObject({
  ...reservedContentShape,
  asset: PublishedAssetSchema,
});
export type ReservedResume = z.infer<typeof ReservedResumeSchema>;

export const PinSchema = z.strictObject({
  sourceId: z.string().min(1),
  route: z.string().startsWith("/"),
  pinOrder: z.number().int().positive(),
});
export type Pin = z.infer<typeof PinSchema>;

export const PublicationSnapshotSchema = z.strictObject({
  schemaVersion: z.literal(CONTRACT_VERSION),
  sourceRevisionFingerprint: fingerprintSchema,
  fullContentFingerprint: fingerprintSchema,
  generatedAt: instantSchema,
  reserved: z.strictObject({
    home: ReservedContentSchema,
    resume: ReservedResumeSchema,
  }),
  entries: z.array(CompiledEntrySchema),
  pins: z.array(PinSchema),
  media: z.array(MediaManifestEntrySchema),
  compiler: z.strictObject({
    name: z.literal("@portfolio/publisher"),
    version: z.string().min(1),
    contentPipelineVersion: z.number().int().positive(),
  }),
});
export type PublicationSnapshot = z.infer<typeof PublicationSnapshotSchema>;
