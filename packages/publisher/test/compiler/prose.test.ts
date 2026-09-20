import type { Element, Root } from "hast";
import { describe, expect, it } from "vitest";

import { compileDocument, proseNormalizationPlugin } from "../../src/index.js";
import { createCompilationContext } from "./test-context.js";

describe("prose normalization", () => {
  it("removes blank editor paragraphs and headings while preserving prose", async () => {
    const context = createCompilationContext();
    const result = await compileDocument(
      "<p>&nbsp;</p><h2> \n </h2><p>Keep <em>me</em>.</p>",
      context,
      [proseNormalizationPlugin],
    );

    expect(result.html).toBe("<p>Keep <em>me</em>.</p>");
    expect(result.searchableText).toBe("Keep me.");
    expect(context.diagnostics.items).toHaveLength(2);
    expect(
      context.diagnostics.items.every(
        ({ code, recordId }) =>
          code === "content.normalized-editor-structure" &&
          recordId === "entry-1",
      ),
    ).toBe(true);
  });

  it("unwraps a paragraph around a block element without flattening children", () => {
    const paragraph: Element = {
      type: "element",
      tagName: "p",
      properties: {},
      children: [
        { type: "text", value: "Before" },
        {
          type: "element",
          tagName: "div",
          properties: { dataKind: "example" },
          children: [{ type: "text", value: "Inside" }],
        },
        { type: "text", value: "After" },
      ],
    };
    const tree: Root = { type: "root", children: [paragraph] };
    const context = createCompilationContext();

    proseNormalizationPlugin.transform(tree, context);

    expect(tree.children).toEqual(paragraph.children);
    expect(context.diagnostics.items).toMatchObject([
      {
        code: "content.normalized-editor-structure",
        recordId: "entry-1",
      },
    ]);
  });
});
