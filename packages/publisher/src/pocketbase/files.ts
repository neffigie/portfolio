import type { AssetFetcher, FetchedAsset } from "../media/types.js";
import type { SourceAsset } from "../model.js";

export interface PocketBaseFileGateway {
  getFileToken(): Promise<string>;
  fileUrl(asset: SourceAsset, token: string): string;
  fetch(url: string): Promise<Response>;
}

export class PocketBaseAssetError extends Error {
  readonly code = "pocketbase.asset" as const;

  constructor() {
    super("PocketBase asset download failed.");
    this.name = "PocketBaseAssetError";
  }
}

function mimeTypeFromFileName(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    pdf: "application/pdf",
  };
  return extension === undefined
    ? "application/octet-stream"
    : (types[extension] ?? "application/octet-stream");
}

function responseMimeType(response: Response, fileName: string): string {
  const header = response.headers.get("content-type")?.split(";", 1)[0]?.trim();
  return header && header.length > 0 ? header : mimeTypeFromFileName(fileName);
}

export function createPocketBaseAssetFetcher(
  gateway: PocketBaseFileGateway,
): AssetFetcher {
  let cachedToken: string | null = null;

  const token = async (refresh: boolean): Promise<string> => {
    if (refresh) {
      cachedToken = null;
    }
    cachedToken ??= await gateway.getFileToken();
    return cachedToken;
  };

  const fetchAsset = async (
    asset: SourceAsset,
    refresh: boolean,
  ): Promise<FetchedAsset> => {
    let response: Response;
    try {
      const authorizedUrl = gateway.fileUrl(asset, await token(refresh));
      response = await gateway.fetch(authorizedUrl);
    } catch {
      throw new PocketBaseAssetError();
    }

    if ((response.status === 401 || response.status === 403) && !refresh) {
      return fetchAsset(asset, true);
    }
    if (!response.ok) {
      throw new PocketBaseAssetError();
    }

    return {
      bytes: new Uint8Array(await response.arrayBuffer()),
      mimeType: responseMimeType(response, asset.fileName),
      originalName: asset.fileName,
    };
  };

  return {
    fetch(asset) {
      return fetchAsset(asset, false);
    },
  };
}
