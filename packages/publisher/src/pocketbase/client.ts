import PocketBase from "pocketbase";

import {
  createPocketBaseSourceFromGateway,
  type PocketBaseRecordGateway,
  type PocketBaseSource,
  toPocketBaseSourceError,
} from "./adapter.js";
import {
  createPocketBaseAssetFetcher,
  type PocketBaseFileGateway,
} from "./files.js";
import { createPocketBaseMediaSourceResolver } from "./media-source.js";
import { normalizePocketBaseOrigin } from "./origin.js";

const entryFields = [
  "id",
  "title",
  "slug",
  "body",
  "type",
  "tags",
  "date",
  "pin_order",
  "asset",
  "created",
  "updated",
  "collectionId",
].join(",");

export interface PocketBaseCredentials {
  url: string;
  superuserEmail: string;
  superuserPassword: string;
}

export async function createPocketBaseSource(
  credentials: PocketBaseCredentials,
): Promise<PocketBaseSource> {
  const origin = normalizePocketBaseOrigin(credentials.url);
  const client = new PocketBase(origin);
  client.autoCancellation(false);
  client.beforeSend = (url, options) => ({
    url,
    options: {
      ...options,
      cache: "no-store",
      headers: {
        ...options.headers,
        "Cache-Control": "no-cache, no-store, max-age=0",
        Pragma: "no-cache",
      },
    },
  });

  try {
    await client
      .collection("_superusers")
      .authWithPassword(
        credentials.superuserEmail,
        credentials.superuserPassword,
      );
  } catch (error) {
    throw toPocketBaseSourceError(error);
  }

  const gateway: PocketBaseRecordGateway = {
    async listEntries(page, perPage) {
      const result = await client.collection("entries").getList(page, perPage, {
        sort: "id",
        fields: entryFields,
      });
      return {
        page: result.page,
        totalPages: result.totalPages,
        items: result.items,
      };
    },
  };
  const fileGateway: PocketBaseFileGateway = {
    getFileToken() {
      return client.files.getToken();
    },
    fileUrl(asset, token) {
      return client.files.getURL(
        { collectionId: asset.collectionId, id: asset.recordId },
        asset.fileName,
        { token },
      );
    },
    fetch(url) {
      return fetch(url, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, max-age=0",
          Pragma: "no-cache",
        },
      });
    },
  };
  return {
    ...createPocketBaseSourceFromGateway(gateway),
    assetFetcher: createPocketBaseAssetFetcher(fileGateway),
    resolveMediaSource: createPocketBaseMediaSourceResolver(origin),
  };
}
