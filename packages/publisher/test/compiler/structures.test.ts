import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  compileDocument,
  headingAnchorsPlugin,
  proseNormalizationPlugin,
  semanticStructuresPlugin,
} from "../../src/index.js";
import { createCompilationContext } from "./test-context.js";

async function fixture(name: string, kind: "source" | "expected") {
  return readFile(
    new URL(`../../../../fixtures/v1/${kind}/${name}.html`, import.meta.url),
    "utf8",
  );
}

const structurePlugins = [semanticStructuresPlugin, proseNormalizationPlugin];

describe("semantic structures", () => {
  it.each(["lists-quotes", "table-subscript", "passthrough"])(
    "matches the preserved %s fixture",
    async (name) => {
      const source = await fixture(name, "source");
      const expected = await fixture(name, "expected");
      const result = await compileDocument(
        source.trim(),
        createCompilationContext(),
        structurePlugins,
      );

      expect(`${result.html}\n`).toBe(expected);
    },
  );

  it("preserves table sections and mixed cell content", async () => {
    const result = await compileDocument(
      '<table><thead><tr><th><em>Name</em></th><th scope="col">Use</th></tr></thead>' +
        "<tbody><tr><td>Compiler</td><td><code>build</code></td></tr></tbody></table>",
      createCompilationContext(),
      structurePlugins,
    );

    expect(result.html).toContain("<thead><tr>");
    expect(result.html).toContain('<th scope="col"><em>Name</em></th>');
    expect(result.html).toContain('<th scope="col">Use</th>');
    expect(result.html).toContain("<tbody><tr>");
    expect(result.html).toContain("<td><code>build</code></td>");
  });

  it("is idempotent for table wrappers and generated heading anchors", async () => {
    const plugins = [
      headingAnchorsPlugin,
      semanticStructuresPlugin,
      proseNormalizationPlugin,
    ];
    const first = await compileDocument(
      "<h2>Data</h2><table><tr><th>Name</th></tr><tr><td>Anna</td></tr></table>",
      createCompilationContext(),
      plugins,
    );
    const second = await compileDocument(
      first.html,
      createCompilationContext(),
      plugins,
    );

    expect(second.html).toBe(first.html);
    expect(second.html.match(/table-scroll/gu)).toHaveLength(1);
    expect(second.html.match(/heading-anchor/gu)).toHaveLength(1);
  });
});
