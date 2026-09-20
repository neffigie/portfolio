import type { DiagnosticCollector } from "./diagnostics.js";
import {
  type NormalizedEntry,
  NormalizedEntrySchema,
  type NormalizedTag,
  type SourceRecord,
} from "./model.js";
import {
  canonicalizeSlug,
  type ReservedSlug,
  ROUTE_MANIFEST,
  resolveRoute,
} from "./routes.js";

export interface NormalizedCorpus {
  home: NormalizedEntry | null;
  about: NormalizedEntry | null;
  resume: NormalizedEntry | null;
  entries: NormalizedEntry[];
  drafts: NormalizedEntry[];
}

const dateOnly = /^\d{4}-\d{2}-\d{2}$/u;
const pocketBaseInstant = /^(\d{4}-\d{2}-\d{2}) (.+)$/u;

function normalizeInstant(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const candidate = dateOnly.test(trimmed)
    ? `${trimmed}T00:00:00.000Z`
    : trimmed.replace(pocketBaseInstant, "$1T$2");
  const timestamp = Date.parse(candidate);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function normalizeTags(values: readonly string[]): NormalizedTag[] {
  const tags: NormalizedTag[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const label = value.trim();
    const key = label.toLocaleLowerCase("en-US");
    if (label.length === 0 || seen.has(key)) {
      continue;
    }

    seen.add(key);
    tags.push({ key, label });
  }

  return tags;
}

function reportPublishedFields(
  entry: NormalizedEntry,
  diagnostics: DiagnosticCollector,
): void {
  const missing = [
    ["title", entry.title],
    ["summary", entry.summary],
    ["body", entry.bodyHtml],
    ["date", entry.date],
  ] as const;

  for (const [field, value] of missing) {
    if (value === null || value.length === 0) {
      diagnostics.error({
        category: "schema",
        code: "schema.published-field",
        message: `Published entry is missing its required ${field}.`,
        recordId: entry.sourceId,
        stage: "normalization",
      });
    }
  }
}

function reportReservedFields(
  slug: ReservedSlug,
  entry: NormalizedEntry,
  diagnostics: DiagnosticCollector,
): void {
  const values: ReadonlyArray<readonly [string, unknown]> =
    slug === "resume"
      ? [
          ["title", entry.title],
          ["asset", entry.asset],
        ]
      : slug === "home"
        ? [
            ["title", entry.title],
            ["summary", entry.summary],
            ["body", entry.bodyHtml],
          ]
        : [
            ["title", entry.title],
            ["body", entry.bodyHtml],
          ];

  for (const [field, value] of values) {
    if (value === null || (typeof value === "string" && value.length === 0)) {
      diagnostics.error({
        category: "schema",
        code: "schema.reserved-field",
        message: `Reserved ${slug} record is missing its required ${field}.`,
        recordId: entry.sourceId,
        stage: "normalization",
      });
    }
  }
}

function invalidInstantFallback(
  record: SourceRecord,
  field: "created" | "updated",
  diagnostics: DiagnosticCollector,
): string {
  const normalized = normalizeInstant(record[field]);
  if (normalized !== null) {
    return normalized;
  }

  diagnostics.error({
    category: "schema",
    code: "schema.invalid-date",
    message: `Record has an invalid ${field} timestamp.`,
    recordId: record.id,
    stage: "normalization",
  });
  return "1970-01-01T00:00:00.000Z";
}

function normalizeRecord(
  record: SourceRecord,
  diagnostics: DiagnosticCollector,
): NormalizedEntry {
  const route = resolveRoute(record.slug, record.type);
  if (route.classification === "invalid") {
    diagnostics.error({
      category: "route",
      code: route.code,
      message: `Published slug ${JSON.stringify(record.slug)} cannot become a public route.`,
      recordId: record.id,
      stage: "normalization",
    });
  }

  const classification =
    route.classification === "invalid" ? "published" : route.classification;
  const normalized = NormalizedEntrySchema.parse({
    sourceId: record.id,
    title: record.title.trim(),
    slug: canonicalizeSlug(record.slug),
    route: route.route,
    summary: record.summary.trim(),
    bodyHtml: record.bodyHtml.trim(),
    type: record.type,
    tags: normalizeTags(record.tags),
    date: record.date === null ? null : normalizeInstant(record.date),
    pinOrder: record.pinOrder,
    asset: record.asset,
    created: invalidInstantFallback(record, "created", diagnostics),
    updated: invalidInstantFallback(record, "updated", diagnostics),
    classification,
  });

  if (classification === "published") {
    reportPublishedFields(normalized, diagnostics);
  }

  if (classification === "draft" && normalized.pinOrder !== null) {
    diagnostics.error({
      category: "schema",
      code: "schema.pin-draft",
      message: "A draft cannot have a pin order.",
      recordId: normalized.sourceId,
      stage: "normalization",
    });
  }

  return normalized;
}

function compareEntries(left: NormalizedEntry, right: NormalizedEntry): number {
  const dateComparison = (right.date ?? "").localeCompare(left.date ?? "");
  return dateComparison === 0
    ? left.slug.localeCompare(right.slug)
    : dateComparison;
}

export function normalizeRecords(
  records: readonly SourceRecord[],
  diagnostics: DiagnosticCollector,
): NormalizedCorpus {
  const normalized = records.map((record) =>
    normalizeRecord(record, diagnostics),
  );
  const corpus: NormalizedCorpus = {
    home: null,
    about: null,
    resume: null,
    entries: [],
    drafts: [],
  };
  const routedSlugs = new Map<string, string>();
  const pinOrders = new Map<number, string>();

  for (const entry of normalized) {
    if (entry.classification === "reserved") {
      const slug = entry.slug as ReservedSlug;
      const existing = corpus[slug];
      if (existing !== null) {
        diagnostics.error({
          category: "route",
          code: "route.slug-collision",
          message: `Reserved route ${JSON.stringify(entry.route)} is claimed by multiple records.`,
          recordId: entry.sourceId,
          stage: "normalization",
        });
      } else {
        corpus[slug] = entry;
        reportReservedFields(slug, entry, diagnostics);
      }
      continue;
    }

    if (entry.classification === "draft") {
      corpus.drafts.push(entry);
      continue;
    }

    corpus.entries.push(entry);
    if (entry.slug.length > 0) {
      const existingId = routedSlugs.get(entry.slug);
      if (existingId !== undefined) {
        diagnostics.error({
          category: "route",
          code: "route.slug-collision",
          message: `Published slug ${JSON.stringify(entry.slug)} is claimed by records ${existingId} and ${entry.sourceId}.`,
          recordId: entry.sourceId,
          stage: "normalization",
        });
      } else {
        routedSlugs.set(entry.slug, entry.sourceId);
      }
    }

    if (entry.pinOrder !== null) {
      const existingId = pinOrders.get(entry.pinOrder);
      if (existingId !== undefined) {
        diagnostics.error({
          category: "schema",
          code: "schema.pin-duplicate",
          message: `Pin order ${entry.pinOrder} is shared by records ${existingId} and ${entry.sourceId}.`,
          recordId: entry.sourceId,
          stage: "normalization",
        });
      } else {
        pinOrders.set(entry.pinOrder, entry.sourceId);
      }
    }
  }

  for (const slug of Object.keys(ROUTE_MANIFEST.reserved) as ReservedSlug[]) {
    if (corpus[slug] === null) {
      diagnostics.error({
        category: "route",
        code: "route.missing-reserved",
        message: `The required reserved ${slug} record is missing.`,
        stage: "normalization",
      });
    }
  }

  corpus.entries.sort(compareEntries);
  corpus.drafts.sort((left, right) => left.slug.localeCompare(right.slug));
  return corpus;
}
