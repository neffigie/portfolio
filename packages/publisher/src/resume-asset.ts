import { basename } from "node:path";

import { sha256 } from "./canonical.js";
import type { DiagnosticCollector } from "./diagnostics.js";
import type {
  ArtifactSink,
  AssetFetcher,
  FetchedAsset,
} from "./media/types.js";
import {
  type PublishedAsset,
  PublishedAssetSchema,
  type SourceAsset,
} from "./model.js";

export async function publishResumeAsset(
  asset: SourceAsset,
  fetcher: AssetFetcher,
  sink: ArtifactSink,
  diagnostics: DiagnosticCollector,
  recordId: string,
): Promise<PublishedAsset> {
  let fetched: FetchedAsset;
  try {
    fetched = await fetcher.fetch(asset);
  } catch (error) {
    diagnostics.error({
      category: "publication",
      code: "publication.resume-unavailable",
      message: `Could not load the résumé asset: ${String(error)}`,
      recordId,
      stage: "resume-publication",
    });
    throw error;
  }

  const isPdf = fetched.mimeType.toLowerCase() === "application/pdf";
  const hasPdfSignature =
    Buffer.from(fetched.bytes.subarray(0, 5)).toString("ascii") === "%PDF-";
  if (fetched.bytes.byteLength === 0 || !isPdf || !hasPdfSignature) {
    diagnostics.error({
      category: "publication",
      code: "publication.invalid-resume",
      message: "The résumé asset must be a non-empty PDF.",
      recordId,
      stage: "resume-publication",
    });
    throw new TypeError("Invalid résumé asset.");
  }

  const hash = sha256(fetched.bytes);
  const fileName = basename(fetched.originalName);
  const path = `assets/resume/${hash}/${fileName}`;
  await sink.writeAtomic(path, fetched.bytes);
  return PublishedAssetSchema.parse({
    hash,
    path: `/${path}`,
    fileName,
    mimeType: "application/pdf",
  });
}
