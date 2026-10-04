import { z } from "zod";

const lockedRule = z.string().nullable();
const rawFieldSchema = z
  .object({
    id: z.string().min(1),
    name: z.string(),
    type: z.string(),
    required: z.boolean().default(false),
    system: z.boolean().optional(),
  })
  .passthrough();
const rawCollectionSchema = z
  .object({
    id: z.string().min(1),
    name: z.string(),
    type: z.string(),
    listRule: lockedRule,
    viewRule: lockedRule,
    createRule: lockedRule,
    updateRule: lockedRule,
    deleteRule: lockedRule,
    fields: z.array(rawFieldSchema),
    indexes: z.array(z.string()),
  })
  .passthrough();

const expectedFields = [
  ["title", "text", true],
  ["slug", "text", true],
  ["body", "editor", false],
  ["type", "select", false],
  ["tags", "select", false],
  ["date", "date", false],
  ["pin_order", "number", false],
  ["asset", "file", false],
] as const;

const expectedIndexes = [
  "CREATE UNIQUE INDEX `idx_entries_slug` ON `entries` (`slug`)",
  "CREATE UNIQUE INDEX `idx_entries_pin_order` ON `entries` (`pin_order`) WHERE `pin_order` > 0",
] as const;

const slugPattern = "^[a-z0-9]+(?:-[a-z0-9]+)*$";
const structuralFieldNames = new Set(["id", "created", "updated"]);

export interface EntriesCollectionContract {
  name: "entries";
  type: "base";
  rules: {
    list: null;
    view: null;
    create: null;
    update: null;
    delete: null;
  };
  fields: Array<[string, string, boolean]>;
  indexes: string[];
}

function fail(message: string): never {
  throw new TypeError(`Invalid PocketBase entries collection: ${message}`);
}

function readCollection(input: unknown): z.infer<typeof rawCollectionSchema> {
  if (!Array.isArray(input)) {
    return fail("the collection export must be an array.");
  }

  const candidate = input.find(
    (value) =>
      typeof value === "object" &&
      value !== null &&
      "name" in value &&
      value.name === "entries",
  );
  if (candidate === undefined) {
    return fail('the export does not contain a collection named "entries".');
  }
  if (
    "schema" in candidate &&
    (!("fields" in candidate) || !Array.isArray(candidate.fields))
  ) {
    throw new TypeError(
      "PocketBase 0.40 collection exports must use fields, not legacy schema.",
    );
  }

  const parsed = rawCollectionSchema.safeParse(candidate);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "the export is malformed.");
  }
  return parsed.data;
}

function requireValue(
  field: z.infer<typeof rawFieldSchema>,
  key: string,
  expected: unknown,
): void {
  const actual = field[key];
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`${field.name}.${key} must be ${JSON.stringify(expected)}.`);
  }
}

export function normalizeEntriesCollection(
  input: unknown,
): EntriesCollectionContract {
  const collection = readCollection(input);
  if (collection.type !== "base") {
    fail("type must be base.");
  }
  if (collection.id !== "pbc_2935399540") {
    fail("id must be the stable entries collection id.");
  }

  const rules = [
    ["listRule", collection.listRule],
    ["viewRule", collection.viewRule],
    ["createRule", collection.createRule],
    ["updateRule", collection.updateRule],
    ["deleteRule", collection.deleteRule],
  ] as const;
  for (const [name, value] of rules) {
    if (value !== null) {
      fail(`${name} must be null (locked/superuser-only).`);
    }
  }

  const customFields = collection.fields.filter(
    ({ name, system }) => system !== true && !structuralFieldNames.has(name),
  );
  const fields = customFields.map(
    ({ name, type, required }) =>
      [name, type, required] as [string, string, boolean],
  );
  if (JSON.stringify(fields) !== JSON.stringify(expectedFields)) {
    fail("custom fields do not match the required entries contract.");
  }

  const byName = new Map(customFields.map((field) => [field.name, field]));
  const title = byName.get("title");
  const slug = byName.get("slug");
  const body = byName.get("body");
  const type = byName.get("type");
  const tags = byName.get("tags");
  const date = byName.get("date");
  const pinOrder = byName.get("pin_order");
  const asset = byName.get("asset");
  if (!(title && slug && body && type && tags && date && pinOrder && asset)) {
    return fail("required custom field metadata is missing.");
  }

  requireValue(title, "min", 1);
  requireValue(slug, "min", 1);
  requireValue(slug, "pattern", slugPattern);
  requireValue(body, "convertURLs", false);
  requireValue(body, "maxSize", 0);
  requireValue(type, "maxSelect", 1);
  requireValue(type, "values", ["writing", "project"]);
  requireValue(tags, "maxSelect", 0);
  if (
    !Array.isArray(tags.values) ||
    !tags.values.every((value: unknown) => typeof value === "string")
  ) {
    fail("tags.values must be an array of strings for a multi-select field.");
  }
  requireValue(date, "min", "");
  requireValue(date, "max", "");
  requireValue(pinOrder, "min", 0);
  requireValue(pinOrder, "onlyInt", true);
  requireValue(asset, "maxSelect", 1);
  requireValue(asset, "maxSize", 10485760);
  requireValue(asset, "protected", true);
  requireValue(asset, "mimeTypes", ["application/pdf"]);
  requireValue(asset, "thumbs", []);

  const structuralFields = new Map(
    collection.fields
      .filter(({ name }) => structuralFieldNames.has(name))
      .map((field) => [field.name, field]),
  );
  const id = structuralFields.get("id");
  const created = structuralFields.get("created");
  const updated = structuralFields.get("updated");
  if (!(id && created && updated) || structuralFields.size !== 3) {
    fail("id, created, and updated structural fields are required.");
  }
  requireValue(id, "primaryKey", true);
  requireValue(id, "system", true);
  requireValue(id, "autogeneratePattern", "[a-z0-9]{15}");
  requireValue(created, "type", "autodate");
  requireValue(created, "onCreate", true);
  requireValue(created, "onUpdate", false);
  requireValue(updated, "type", "autodate");
  requireValue(updated, "onCreate", true);
  requireValue(updated, "onUpdate", true);

  if (JSON.stringify(collection.indexes) !== JSON.stringify(expectedIndexes)) {
    fail(
      "indexes do not match the required unique slug and pin-order indexes.",
    );
  }

  return {
    name: "entries",
    type: "base",
    rules: {
      list: null,
      view: null,
      create: null,
      update: null,
      delete: null,
    },
    fields,
    indexes: [...collection.indexes],
  };
}

export function assertEntriesCollection(input: unknown): void {
  normalizeEntriesCollection(input);
}
