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

export const PublishedAssetSchema = z.strictObject({
  hash: fingerprintSchema,
  path: z.string().startsWith("/"),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
});
export type PublishedAsset = z.infer<typeof PublishedAssetSchema>;

export const PostKindSchema = z.enum(["home", "resume", "writing", "project"]);
export type PostKind = z.infer<typeof PostKindSchema>;

export function isListedPostKind(
  kind: PostKind,
): kind is Extract<PostKind, EntryType> {
  return kind === "writing" || kind === "project";
}

export const PostSchema = z
  .strictObject({
    sourceId: z.string().min(1),
    kind: PostKindSchema,
    title: z.string().min(1),
    slug: z.string().min(1),
    route: z.string().startsWith("/"),
    previewText: z.string(),
    tags: z.array(NormalizedTagSchema),
    date: instantSchema.nullable(),
    updated: instantSchema,
    pinOrder: z.number().int().positive().nullable(),
    html: z.string(),
    searchableText: z.string(),
    asset: PublishedAssetSchema.nullable(),
    mediaHashes: z.array(fingerprintSchema),
    contentFingerprint: fingerprintSchema,
    sourceRevisionFingerprint: fingerprintSchema,
  })
  .superRefine((post, context) => {
    if (isListedPostKind(post.kind)) {
      if (post.date === null) {
        context.addIssue({
          code: "custom",
          path: ["date"],
          message: `A ${post.kind} post requires a date.`,
        });
      }
      if (post.html.length === 0) {
        context.addIssue({
          code: "custom",
          path: ["html"],
          message: `A ${post.kind} post requires a body.`,
        });
      }
    } else if (post.pinOrder !== null) {
      context.addIssue({
        code: "custom",
        path: ["pinOrder"],
        message: `The ${post.kind} post cannot be pinned.`,
      });
    }
    if (post.kind === "resume" && post.asset === null) {
      context.addIssue({
        code: "custom",
        path: ["asset"],
        message: "The résumé post requires its PDF asset.",
      });
    }
  });
export type Post = z.infer<typeof PostSchema>;

export const PublicationSnapshotSchema = z
  .strictObject({
    schemaVersion: z.literal(CONTRACT_VERSION),
    sourceRevisionFingerprint: fingerprintSchema,
    fullContentFingerprint: fingerprintSchema,
    generatedAt: instantSchema,
    posts: z.array(PostSchema),
    media: z.array(MediaManifestEntrySchema),
    compiler: z.strictObject({
      name: z.literal("@portfolio/publisher"),
      version: z.string().min(1),
      contentPipelineVersion: z.number().int().positive(),
    }),
  })
  .superRefine((snapshot, context) => {
    for (const kind of ["home", "resume"] as const) {
      const count = snapshot.posts.filter((post) => post.kind === kind).length;
      if (count !== 1) {
        context.addIssue({
          code: "custom",
          path: ["posts"],
          message: `A publication requires exactly one ${kind} post; found ${count}.`,
        });
      }
    }
  });
export type PublicationSnapshot = z.infer<typeof PublicationSnapshotSchema>;
