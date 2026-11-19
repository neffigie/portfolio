import { z } from "zod";

import {
  type SourceRecord,
  SourceRecordSchema,
  type SourceSocialLink,
  SourceSocialLinkSchema,
} from "../model.js";

export const PocketBaseEntryRecordSchema = z.strictObject({
  id: z.string().min(1),
  collectionId: z.string().min(1),
  title: z.string(),
  slug: z.string(),
  body: z.string(),
  type: z.union([z.literal(""), z.literal("writing"), z.literal("project")]),
  tags: z.union([z.array(z.string()), z.string(), z.null()]),
  date: z.string(),
  pin_order: z.number().int().nonnegative(),
  asset: z.string(),
  created: z.string().min(1),
  updated: z.string().min(1),
});

export type PocketBaseEntryRecord = z.infer<typeof PocketBaseEntryRecordSchema>;

export const PocketBaseSocialLinkRecordSchema = z.strictObject({
  id: z.string().min(1),
  service: z.string(),
  label: z.string(),
  href: z.string(),
  sort_order: z.number().int().nonnegative(),
  enabled: z.boolean(),
  updated: z.string().min(1),
});

const blockElement =
  "address|article|aside|blockquote|dd|details|div|dl|dt|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|ul";
const editorBlockSeparator = new RegExp(
  `(<\\/?(?:${blockElement})\\b[^>]*>)\\s*\\n\\s*(?=<\\/?(?:${blockElement})\\b)`,
  "giu",
);

function normalizeEditorHtml(body: string): string {
  return body.replace(editorBlockSeparator, "$1");
}

export function mapPocketBaseEntry(recordInput: unknown): SourceRecord {
  const record = PocketBaseEntryRecordSchema.parse(recordInput);
  return SourceRecordSchema.parse({
    id: record.id,
    title: record.title,
    slug: record.slug,
    bodyHtml: normalizeEditorHtml(record.body),
    type: record.type === "" ? null : record.type,
    tags:
      record.tags === "" || record.tags === null
        ? []
        : typeof record.tags === "string"
          ? [record.tags]
          : record.tags,
    date: record.date === "" ? null : record.date,
    pinOrder: record.pin_order === 0 ? null : record.pin_order,
    asset:
      record.asset === ""
        ? null
        : {
            kind: "pocketbase-file",
            recordId: record.id,
            collectionId: record.collectionId,
            fileName: record.asset,
          },
    created: record.created,
    updated: record.updated,
  });
}

export function mapPocketBaseSocialLink(
  recordInput: unknown,
): SourceSocialLink {
  const record = PocketBaseSocialLinkRecordSchema.parse(recordInput);
  return SourceSocialLinkSchema.parse({
    id: record.id,
    service: record.service === "x/twitter" ? "x" : record.service,
    label: record.label,
    href: record.href,
    sortOrder: record.sort_order,
    enabled: record.enabled,
    updated: record.updated,
  });
}
