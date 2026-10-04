import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  assertEntriesCollection,
  normalizeEntriesCollection,
} from "../../src/index.js";

const schemaPath = new URL(
  "../../../../fixtures/pocketbase/entries.schema.json",
  import.meta.url,
);

describe("PocketBase entries collection", () => {
  it("is a complete PocketBase 0.40 import artifact", async () => {
    const input = JSON.parse(await readFile(schemaPath, "utf8")) as Array<{
      id?: string;
      fields?: Array<{ id?: string; name?: string; type?: string }>;
    }>;

    expect(input).toHaveLength(1);
    expect(input[0]?.id).toBe("pbc_2935399540");
    expect(input[0]?.fields?.map(({ name }) => name)).toEqual([
      "id",
      "title",
      "slug",
      "body",
      "type",
      "tags",
      "date",
      "pin_order",
      "asset",
      "created",
      "updated",
    ]);
    expect(input[0]?.fields?.every(({ id }) => Boolean(id))).toBe(true);
    expect(input[0]?.fields?.find(({ name }) => name === "id")).toMatchObject({
      type: "text",
    });
    expect(
      input[0]?.fields?.find(({ name }) => name === "created"),
    ).toMatchObject({
      type: "autodate",
    });
    expect(
      input[0]?.fields?.find(({ name }) => name === "updated"),
    ).toMatchObject({
      type: "autodate",
    });
  });

  it("matches the private PocketBase 0.40 contract", async () => {
    const input: unknown = JSON.parse(await readFile(schemaPath, "utf8"));

    expect(() => assertEntriesCollection(input)).not.toThrow();
    expect(normalizeEntriesCollection(input)).toEqual({
      name: "entries",
      type: "base",
      rules: {
        list: null,
        view: null,
        create: null,
        update: null,
        delete: null,
      },
      fields: [
        ["title", "text", true],
        ["slug", "text", true],
        ["body", "editor", false],
        ["type", "select", false],
        ["tags", "select", false],
        ["date", "date", false],
        ["pin_order", "number", false],
        ["asset", "file", false],
      ],
      indexes: [
        "CREATE UNIQUE INDEX `idx_entries_slug` ON `entries` (`slug`)",
        "CREATE UNIQUE INDEX `idx_entries_pin_order` ON `entries` (`pin_order`) WHERE `pin_order` > 0",
      ],
    });
  });

  it("rejects a legacy 0.22 schema export", () => {
    expect(() =>
      assertEntriesCollection([{ name: "entries", type: "base", schema: [] }]),
    ).toThrow(/PocketBase 0\.40.*fields/u);
  });

  it("rejects public list or view access", async () => {
    const input = JSON.parse(await readFile(schemaPath, "utf8")) as Array<
      Record<string, unknown>
    >;

    expect(() =>
      assertEntriesCollection([{ ...input[0], listRule: "" }]),
    ).toThrow(/listRule/u);
    expect(() =>
      assertEntriesCollection([{ ...input[0], viewRule: "" }]),
    ).toThrow(/viewRule/u);
  });
});
