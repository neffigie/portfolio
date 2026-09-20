import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  compileDocument,
  headingAnchorsPlugin,
  linkClassificationPlugin,
  proseNormalizationPlugin,
} from "../../src/index.js";
import { createCompilationContext } from "./test-context.js";

describe("link classification", () => {
  it("matches the preserved headings and links fixture", async () => {
    const source = await readFile(
      new URL(
        "../../../../fixtures/v1/source/headings-links.html",
        import.meta.url,
      ),
      "utf8",
    );
    const expected = await readFile(
      new URL(
        "../../../../fixtures/v1/expected/headings-links.html",
        import.meta.url,
      ),
      "utf8",
    );

    const result = await compileDocument(
      source.trim(),
      createCompilationContext(),
      [
        linkClassificationPlugin,
        headingAnchorsPlugin,
        proseNormalizationPlugin,
      ],
    );

    expect(`${result.html}\n`).toBe(expected);
  });

  it("classifies fragments, relative URLs, and same-origin URLs as internal", async () => {
    const result = await compileDocument(
      '<a href="#part">Fragment</a><a href="../about">About</a><a href="https://neffigie.dev/resume">Résumé</a>',
      createCompilationContext(),
      [linkClassificationPlugin, proseNormalizationPlugin],
    );

    expect(result.html.match(/data-link-kind="internal"/gu)).toHaveLength(3);
    expect(result.html).toContain('href="#part"');
    expect(result.html).toContain('href="../about"');
    expect(result.html).toContain('href="https://neffigie.dev/resume"');
  });

  it("secures external HTTP links without forcing or removing a target", async () => {
    const result = await compileDocument(
      '<a href="https://example.com" rel="nofollow">No target</a><a href="https://example.org" target="_blank">Authored target</a>',
      createCompilationContext(),
      [linkClassificationPlugin, proseNormalizationPlugin],
    );

    expect(result.html).toContain(
      'href="https://example.com" rel="nofollow noopener noreferrer" data-link-kind="external"',
    );
    expect(result.html).toContain(
      'href="https://example.org" target="_blank" data-link-kind="external" rel="noopener noreferrer"',
    );
  });

  it("leaves mail links intact and rejects javascript links", async () => {
    const context = createCompilationContext();
    const result = await compileDocument(
      '<a href="mailto:anna@example.com" target="mail">Email</a>' +
        '<a id="plain-unsafe" href="javascript:alert(1)">Unsafe</a>' +
        '<a id="obfuscated-unsafe" href="java&#10;script:alert(2)">Also unsafe</a>',
      context,
      [linkClassificationPlugin, proseNormalizationPlugin],
    );

    expect(result.html).toContain(
      'href="mailto:anna@example.com" target="mail"',
    );
    expect(result.html).not.toContain("javascript:");
    expect(result.html).not.toContain('id="plain-unsafe" href');
    expect(result.html).not.toContain('id="obfuscated-unsafe" href');
    expect(context.diagnostics.items).toHaveLength(2);
    expect(
      context.diagnostics.items.every(
        ({ severity, code, recordId }) =>
          severity === "error" &&
          code === "content.invalid-link" &&
          recordId === "entry-1",
      ),
    ).toBe(true);
  });
});
