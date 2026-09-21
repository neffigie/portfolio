import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  compileDocument,
  createCodeHighlightingPlugin,
  createContentPlugins,
  detectCorpusLanguages,
  orderPlugins,
  proseNormalizationPlugin,
} from "../../src/index.js";
import { createCompilationContext } from "./test-context.js";

describe("code highlighting", () => {
  it("assembles the configured compiler through the central registry", () => {
    expect(
      orderPlugins(createContentPlugins(new Set(["typescript"]))).map(
        ({ name }) => name,
      ),
    ).toEqual([
      "prose-normalization",
      "code-highlighting",
      "responsive-images",
      "heading-anchors",
      "link-classification",
      "semantic-structures",
    ]);
  });

  it("detects and normalizes corpus language aliases", () => {
    expect(
      detectCorpusLanguages([
        '<pre><code class="language-ts">let value = 1</code></pre>',
        '<pre><code class="lang-js">const value = 1</code></pre>',
        '<pre><code class="language-madeup">signal</code></pre>',
      ]),
    ).toEqual(new Set(["typescript", "javascript", "madeup"]));
  });

  it("highlights known blocks while preserving inline and unlabelled code", async () => {
    const context = createCompilationContext();
    const result = await compileDocument(
      "<p>Use <code>const value = 1;</code> inline.</p>" +
        '<pre><code class="language-ts">const less = 1 &lt; 2;\n</code></pre>' +
        "<pre><code>plain &amp; readable\n</code></pre>",
      context,
      [
        createCodeHighlightingPlugin(new Set(["typescript"])),
        proseNormalizationPlugin,
      ],
    );

    expect(result.html).toContain(
      "<p>Use <code>const value = 1;</code> inline.</p>",
    );
    expect(result.html).toContain('<pre class="shiki');
    expect(result.html).toContain('<span class="line">');
    expect(result.html).toContain("&#x3C;");
    expect(result.html).not.toContain(" 1 < 2");
    expect(result.html).toContain("plain &#x26; readable\n</code></pre>");
    expect(result.searchableText).toContain("const less = 1 < 2;");
    expect(context.diagnostics.items).toEqual([]);
    await expect(result.html).toMatchFileSnapshot(
      "__snapshots__/code-known.html",
    );
  });

  it("accepts the legacy lang-js class", async () => {
    const result = await compileDocument(
      '<pre><code class="lang-js">const value = true;\n</code></pre>',
      createCompilationContext(),
      [
        createCodeHighlightingPlugin(new Set(["javascript"])),
        proseNormalizationPlugin,
      ],
    );

    expect(result.html).toContain('<pre class="shiki');
    expect(result.html).toContain("const");
    expect(result.html).toContain("true");
  });

  it("keeps an unknown language plain and emits one warning", async () => {
    const source = await readFile(
      new URL("../../../../fixtures/v1/source/code.html", import.meta.url),
      "utf8",
    );
    const context = createCompilationContext();
    const result = await compileDocument(source.trim(), context, [
      createCodeHighlightingPlugin(new Set(["typescript"])),
      proseNormalizationPlugin,
    ]);

    expect(result.html).toContain(
      '<pre><code class="language-madeup">signal &#x26; response\n</code></pre>',
    );
    expect(context.diagnostics.items).toMatchObject([
      {
        severity: "warning",
        code: "content.unknown-code-language",
        recordId: "entry-1",
      },
    ]);
    expect(context.diagnostics.items[0]?.message).toContain("madeup");
  });
});
