import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import {
  compileDocument,
  DiagnosticCollector,
  type MediaRequest,
  type MediaRequestCollector,
  proseNormalizationPlugin,
  type ResolvedMedia,
  responsiveImagesPlugin,
} from "../../src/index.js";

const hash = "a".repeat(64);
const resolvedMedia: ResolvedMedia = {
  hash,
  mimeType: "image/png",
  width: 1200,
  height: 800,
  fallbackPath: `/assets/media/${hash}/original.png`,
  variants: [
    {
      path: `/assets/media/${hash}/480.webp`,
      width: 480,
      height: 320,
      mimeType: "image/webp",
    },
    {
      path: `/assets/media/${hash}/960.webp`,
      width: 960,
      height: 640,
      mimeType: "image/webp",
    },
  ],
  ownerIds: ["entry-1"],
};

class FakeMediaCollector implements MediaRequestCollector {
  readonly requests: Array<{ id: string; request: MediaRequest }> = [];

  request(request: MediaRequest): string {
    const id = `media-${this.requests.length + 1}`;
    this.requests.push({ id, request });
    return id;
  }

  async resolve(_requestId: string): Promise<ResolvedMedia> {
    return resolvedMedia;
  }

  requestIds(): readonly string[] {
    return this.requests.map(({ id }) => id);
  }
}

function context(media: MediaRequestCollector) {
  return {
    recordId: "entry-1",
    route: "/entry-1",
    siteOrigin: "https://neffigie.dev",
    diagnostics: new DiagnosticCollector(),
    media,
  };
}

describe("responsive images", () => {
  it("transforms the preserved figure vocabulary without leaking raw sources", async () => {
    const source = await readFile(
      new URL("../../../../fixtures/v1/source/figures.html", import.meta.url),
      "utf8",
    );
    const media = new FakeMediaCollector();
    const compilationContext = context(media);
    const result = await compileDocument(source.trim(), compilationContext, [
      responsiveImagesPlugin,
      proseNormalizationPlugin,
    ]);

    expect(media.requests.map(({ request }) => request.source)).toEqual([
      expect.stringMatching(/^data:image\/png;base64,/u),
      "/api/files/entries/record/diagram.png",
    ]);
    expect(result.mediaRequestIds).toEqual(["media-1", "media-2"]);
    expect(result.html).toContain("<figure><picture>");
    expect(result.html).toContain(
      "<figcaption>Embedded editor image.</figcaption></figure>",
    );
    expect(result.html).toContain(
      `srcset="/assets/media/${hash}/480.webp 480w, /assets/media/${hash}/960.webp 960w"`,
    );
    expect(result.html).toContain(`src="/assets/media/${hash}/original.png"`);
    expect(result.html).toContain('alt="A one-pixel diagram"');
    expect(result.html).toContain('width="1200" height="800"');
    expect(result.html).not.toContain("data:image/");
    expect(result.html).not.toContain("/api/files/");
    await expect(result.html).toMatchFileSnapshot(
      "__snapshots__/responsive-images.html",
    );
  });

  it("preserves explicit empty alt without warning", async () => {
    const media = new FakeMediaCollector();
    const compilationContext = context(media);
    const result = await compileDocument(
      '<p><img src="data:image/png;base64,AA==" alt=""></p>',
      compilationContext,
      [responsiveImagesPlugin, proseNormalizationPlugin],
    );

    expect(result.html).toContain('alt=""');
    expect(compilationContext.diagnostics.items).toEqual([]);
  });

  it("adds empty alt and warns when authored alt is missing", async () => {
    const media = new FakeMediaCollector();
    const compilationContext = context(media);
    const result = await compileDocument(
      '<img src="/api/files/entries/record/missing-alt.png">',
      compilationContext,
      [responsiveImagesPlugin, proseNormalizationPlugin],
    );

    expect(result.html).toContain('alt=""');
    expect(compilationContext.diagnostics.items).toMatchObject([
      {
        severity: "warning",
        code: "content.missing-image-alt",
        recordId: "entry-1",
      },
    ]);
  });

  it("preserves authored presentational attributes and deduplicated media identity", async () => {
    const media = new FakeMediaCollector();
    const result = await compileDocument(
      '<img src="same.png" alt="First" class="diagram" title="Diagram" loading="eager"><img src="same.png" alt="Second">',
      context(media),
      [responsiveImagesPlugin, proseNormalizationPlugin],
    );

    expect(media.requests).toHaveLength(2);
    expect(result.html.match(new RegExp(hash, "gu"))?.length).toBeGreaterThan(
      1,
    );
    expect(result.html).toContain('class="diagram"');
    expect(result.html).toContain('title="Diagram"');
    expect(result.html).toContain('loading="eager"');
    expect(result.html.match(/loading=/gu)).toHaveLength(1);
  });
});
