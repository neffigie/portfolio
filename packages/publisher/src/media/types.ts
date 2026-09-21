import type { DiagnosticCollector } from "../diagnostics.js";
import type { MediaManifestEntry, SourceAsset } from "../model.js";

export interface DataUriAsset {
  kind: "data-uri";
  uri: string;
  originalName: string;
}

export type MediaSource = SourceAsset | DataUriAsset;

export interface FetchedAsset {
  bytes: Uint8Array;
  mimeType: string;
  originalName: string;
}

export interface AssetFetcher {
  fetch(asset: SourceAsset): Promise<FetchedAsset>;
}

export interface ArtifactSink {
  writeAtomic(path: string, bytes: Uint8Array): Promise<void>;
}

export interface MediaPolicy {
  widths: readonly number[];
  webpQuality: number;
  jpegFallbackQuality: number;
}

export type ResolvedMedia = MediaManifestEntry;

export interface MediaResolverOptions {
  fetcher: AssetFetcher;
  sink: ArtifactSink;
  diagnostics: DiagnosticCollector;
  policy?: MediaPolicy;
}
