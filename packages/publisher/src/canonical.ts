import { createHash } from "node:crypto";

import type { SourceRecord } from "./model.js";
import { canonicalizeSlug, ROUTE_MANIFEST } from "./routes.js";

function compareText(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

function serialize(value: unknown, active: Set<object>): string {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("Canonical JSON cannot encode a non-finite number.");
    }
    return JSON.stringify(value);
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new TypeError("Canonical JSON cannot encode an invalid Date.");
    }
    return JSON.stringify(value.toISOString());
  }

  if (typeof value !== "object") {
    throw new TypeError(`Canonical JSON cannot encode ${typeof value}.`);
  }

  if (active.has(value)) {
    throw new TypeError("Canonical JSON cannot encode cyclic input.");
  }
  active.add(value);

  try {
    if (Array.isArray(value)) {
      return `[${value.map((item) => serialize(item, active)).join(",")}]`;
    }

    const prototype = Object.getPrototypeOf(value) as object | null;
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError("Canonical JSON only supports plain objects.");
    }
    if (Object.getOwnPropertySymbols(value).length > 0) {
      throw new TypeError("Canonical JSON cannot encode symbol keys.");
    }

    const record = value as Record<string, unknown>;
    const properties = Object.keys(record)
      .sort(compareText)
      .map((key) => `${JSON.stringify(key)}:${serialize(record[key], active)}`);
    return `{${properties.join(",")}}`;
  } finally {
    active.delete(value);
  }
}

export function canonicalStringify(value: unknown): string {
  return serialize(value, new Set<object>());
}

export function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function isPublishedOrReserved(record: SourceRecord): boolean {
  if (record.type !== null) {
    return true;
  }

  const slug = canonicalizeSlug(record.slug);
  return Object.hasOwn(ROUTE_MANIFEST.reserved, slug);
}

function canonicalInstant(value: string): string {
  const normalized = value.replace(/^(\d{4}-\d{2}-\d{2}) (.+)$/u, "$1T$2");
  const timestamp = Date.parse(normalized);
  if (Number.isNaN(timestamp)) {
    throw new TypeError(
      `Cannot fingerprint invalid timestamp ${JSON.stringify(value)}.`,
    );
  }
  return new Date(timestamp).toISOString();
}

export function sourceRevisionFingerprint(
  records: readonly SourceRecord[],
): string {
  const revisions = records
    .filter(isPublishedOrReserved)
    .map((record) => ({
      asset: record.asset,
      id: record.id,
      pinOrder: record.pinOrder,
      slug: canonicalizeSlug(record.slug),
      type: record.type,
      updated: canonicalInstant(record.updated),
    }))
    .sort((left, right) => {
      const idComparison = compareText(left.id, right.id);
      return idComparison === 0
        ? compareText(canonicalStringify(left), canonicalStringify(right))
        : idComparison;
    });

  return sha256(canonicalStringify(revisions));
}
