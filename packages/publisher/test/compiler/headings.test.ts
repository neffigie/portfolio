import { describe, expect, it } from "vitest";

import {
  compileDocument,
  headingAnchorsPlugin,
  proseNormalizationPlugin,
} from "../../src/index.js";
import { createCompilationContext } from "./test-context.js";

describe("heading anchors", () => {
  it("creates readable, unique IDs from nested heading text", async () => {
    const result = await compileDocument(
      "<h2>Overview</h2><h3>Over<strong>view</strong></h3><h2>你好</h2>",
      createCompilationContext(),
      [headingAnchorsPlugin, proseNormalizationPlugin],
    );

    expect(result.html).toBe(
      '<h2 id="overview">Overview<a class="heading-anchor" href="#overview" aria-label="Link to Overview">#</a></h2>' +
        '<h3 id="overview-2">Over<strong>view</strong><a class="heading-anchor" href="#overview-2" aria-label="Link to Overview">#</a></h3>' +
        '<h2 id="section">你好<a class="heading-anchor" href="#section" aria-label="Link to 你好">#</a></h2>',
    );
    expect(result.searchableText).toBe("Overview Overview 你好");
  });

  it("preserves a unique valid authored ID", async () => {
    const result = await compileDocument(
      '<h2 id="architecture.v2">Architecture</h2>',
      createCompilationContext(),
      [headingAnchorsPlugin, proseNormalizationPlugin],
    );

    expect(result.html).toContain('id="architecture.v2"');
    expect(result.html).toContain('href="#architecture.v2"');
  });

  it("is idempotent and never duplicates its self-link", async () => {
    const first = await compileDocument(
      "<h2>Overview</h2>",
      createCompilationContext(),
      [headingAnchorsPlugin, proseNormalizationPlugin],
    );
    const second = await compileDocument(
      first.html,
      createCompilationContext(),
      [headingAnchorsPlugin, proseNormalizationPlugin],
    );

    expect(second.html).toBe(first.html);
    expect(second.html.match(/heading-anchor/gu)).toHaveLength(1);
  });
});
