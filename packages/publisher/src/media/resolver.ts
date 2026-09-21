import { type Metadata, type Sharp, default as sharp } from "sharp";

import { canonicalStringify, sha256 } from "../canonical.js";
import type { DiagnosticCollector } from "../diagnostics.js";
import { type MediaManifestEntry, MediaManifestEntrySchema } from "../model.js";
import {
  DataUriError,
  decodeDataUri,
  type SupportedImageMimeType,
} from "./data-uri.js";
import { DEFAULT_MEDIA_POLICY } from "./policy.js";
import type {
  FetchedAsset,
  MediaResolverOptions,
  MediaSource,
  ResolvedMedia,
} from "./types.js";

const formatContract = {
  jpeg: { mimeType: "image/jpeg", extension: "jpg" },
  png: { mimeType: "image/png", extension: "png" },
  webp: { mimeType: "image/webp", extension: "webp" },
} as const;

type SupportedFormat = keyof typeof formatContract;

export class MediaResolutionError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "MediaResolutionError";
  }
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function isSupportedFormat(
  value: string | undefined,
): value is SupportedFormat {
  return value !== undefined && Object.hasOwn(formatContract, value);
}

function orientedDimensions(metadata: Metadata): {
  width: number;
  height: number;
} | null {
  if (metadata.width === undefined || metadata.height === undefined) {
    return null;
  }
  return metadata.orientation !== undefined && metadata.orientation >= 5
    ? { width: metadata.height, height: metadata.width }
    : { width: metadata.width, height: metadata.height };
}

function outputFormat(
  pipeline: Sharp,
  format: SupportedFormat,
  jpegQuality: number,
): Sharp {
  if (format === "jpeg") {
    return pipeline.jpeg({ quality: jpegQuality });
  }
  if (format === "png") {
    return pipeline.png({ compressionLevel: 9 });
  }
  return pipeline.webp({ quality: 100, lossless: true });
}

export class MediaResolver {
  readonly #fetcher: MediaResolverOptions["fetcher"];
  readonly #sink: MediaResolverOptions["sink"];
  readonly #diagnostics: DiagnosticCollector;
  readonly #policy: NonNullable<MediaResolverOptions["policy"]>;
  readonly #sourceLoads = new Map<string, Promise<FetchedAsset>>();
  readonly #processing = new Map<string, Promise<MediaManifestEntry>>();
  readonly #entries = new Map<string, MediaManifestEntry>();
  readonly #owners = new Map<string, Set<string>>();

  constructor(options: MediaResolverOptions) {
    this.#fetcher = options.fetcher;
    this.#sink = options.sink;
    this.#diagnostics = options.diagnostics;
    this.#policy = options.policy ?? DEFAULT_MEDIA_POLICY;
  }

  #fail(code: string, message: string, recordId: string): never {
    this.#diagnostics.error({
      category: "media",
      code,
      message,
      recordId,
      stage: "media-resolution",
    });
    throw new MediaResolutionError(code, message);
  }

  #load(source: MediaSource): Promise<FetchedAsset> {
    const key = canonicalStringify(source);
    const existing = this.#sourceLoads.get(key);
    if (existing !== undefined) {
      return existing;
    }

    const pending =
      source.kind === "data-uri"
        ? Promise.resolve(decodeDataUri(source.uri)).then((decoded) => ({
            ...decoded,
            originalName: source.originalName,
          }))
        : this.#fetcher.fetch(source);
    this.#sourceLoads.set(key, pending);
    return pending;
  }

  async #process(
    fetched: FetchedAsset,
    hash: string,
    ownerId: string,
  ): Promise<MediaManifestEntry> {
    let metadata: Metadata;
    try {
      metadata = await sharp(fetched.bytes).metadata();
    } catch (error) {
      return this.#fail(
        "media.decode-failed",
        `Could not decode image ${JSON.stringify(fetched.originalName)}: ${String(error)}`,
        ownerId,
      );
    }

    if (!isSupportedFormat(metadata.format)) {
      return this.#fail(
        "media.unsupported-type",
        `Unsupported decoded image format ${JSON.stringify(metadata.format)}.`,
        ownerId,
      );
    }
    const contract = formatContract[metadata.format];
    const claimedMimeType = fetched.mimeType.toLowerCase();
    if (claimedMimeType !== contract.mimeType) {
      return this.#fail(
        "media.mime-mismatch",
        `Claimed MIME type ${claimedMimeType} does not match decoded MIME type ${contract.mimeType}.`,
        ownerId,
      );
    }

    const dimensions = orientedDimensions(metadata);
    if (dimensions === null) {
      return this.#fail(
        "media.missing-dimensions",
        "Decoded image has no intrinsic dimensions.",
        ownerId,
      );
    }

    const directory = `assets/media/${hash}`;
    const fallbackRelativePath = `${directory}/original.${contract.extension}`;
    const fallbackPipeline = outputFormat(
      sharp(fetched.bytes).autoOrient(),
      metadata.format,
      this.#policy.jpegFallbackQuality,
    );
    const fallback = await fallbackPipeline.toBuffer({
      resolveWithObject: true,
    });
    await this.#sink.writeAtomic(fallbackRelativePath, fallback.data);

    const variants = [];
    for (const width of [...this.#policy.widths].sort(
      (left, right) => left - right,
    )) {
      if (width > dimensions.width) {
        continue;
      }
      const relativePath = `${directory}/${width}.webp`;
      const output = await sharp(fetched.bytes)
        .autoOrient()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: this.#policy.webpQuality })
        .toBuffer({ resolveWithObject: true });
      await this.#sink.writeAtomic(relativePath, output.data);
      variants.push({
        path: `/${relativePath}`,
        width: output.info.width,
        height: output.info.height,
        mimeType: "image/webp",
      });
    }

    return MediaManifestEntrySchema.parse({
      hash,
      mimeType: contract.mimeType satisfies SupportedImageMimeType,
      width: fallback.info.width,
      height: fallback.info.height,
      fallbackPath: `/${fallbackRelativePath}`,
      variants,
      ownerIds: [],
    });
  }

  async resolve(source: MediaSource, ownerId: string): Promise<ResolvedMedia> {
    let fetched: FetchedAsset;
    try {
      fetched = await this.#load(source);
    } catch (error) {
      return this.#fail(
        error instanceof DataUriError ? error.code : "media.source-invalid",
        `Could not load media source: ${String(error)}`,
        ownerId,
      );
    }
    if (fetched.bytes.byteLength === 0) {
      return this.#fail(
        "media.empty-asset",
        `Media asset ${JSON.stringify(fetched.originalName)} is empty.`,
        ownerId,
      );
    }

    const hash = sha256(fetched.bytes);
    const owners = this.#owners.get(hash) ?? new Set<string>();
    owners.add(ownerId);
    this.#owners.set(hash, owners);

    let pending = this.#processing.get(hash);
    if (pending === undefined) {
      pending = this.#process(fetched, hash, ownerId);
      this.#processing.set(hash, pending);
    }
    const entry = await pending;
    this.#entries.set(hash, entry);
    return {
      ...entry,
      ownerIds: [...owners].sort(compareText),
    };
  }

  manifest(): MediaManifestEntry[] {
    return [...this.#entries.values()]
      .map((entry) => ({
        ...entry,
        ownerIds: [...(this.#owners.get(entry.hash) ?? [])].sort(compareText),
      }))
      .sort((left, right) => compareText(left.hash, right.hash));
  }
}
