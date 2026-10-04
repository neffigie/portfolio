import { z } from "zod";

import type { AssetFetcher, MediaSourceResolver } from "../media/types.js";
import type { SourceRecord } from "../model.js";
import { mapPocketBaseEntry } from "./types.js";

const pageSchema = z.object({
  page: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
  items: z.array(z.unknown()),
});

export type PocketBaseSourceErrorCode =
  | "pocketbase.authentication"
  | "pocketbase.transport"
  | "pocketbase.response";

export class PocketBaseSourceError extends Error {
  readonly code: PocketBaseSourceErrorCode;

  constructor(code: PocketBaseSourceErrorCode) {
    const messages: Record<PocketBaseSourceErrorCode, string> = {
      "pocketbase.authentication": "PocketBase authentication failed.",
      "pocketbase.transport": "PocketBase could not be reached.",
      "pocketbase.response": "PocketBase returned an invalid response.",
    };
    super(messages[code]);
    this.name = "PocketBaseSourceError";
    this.code = code;
  }
}

export interface PocketBaseRecordGateway {
  listEntries(
    page: number,
    perPage: number,
  ): Promise<{ page: number; totalPages: number; items: unknown[] }>;
}

export interface PocketBaseSource {
  listSourceRecords(): Promise<SourceRecord[]>;
  assetFetcher: AssetFetcher;
  resolveMediaSource: MediaSourceResolver;
}

function errorStatus(error: unknown): number | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }
  return null;
}

export function toPocketBaseSourceError(error: unknown): PocketBaseSourceError {
  if (error instanceof PocketBaseSourceError) {
    return error;
  }
  const status = errorStatus(error);
  if (status === 401 || status === 403) {
    return new PocketBaseSourceError("pocketbase.authentication");
  }
  if (error instanceof TypeError || status === 0) {
    return new PocketBaseSourceError("pocketbase.transport");
  }
  return new PocketBaseSourceError("pocketbase.response");
}

export function createPocketBaseSourceFromGateway(
  gateway: PocketBaseRecordGateway,
): Pick<PocketBaseSource, "listSourceRecords"> {
  return {
    async listSourceRecords(): Promise<SourceRecord[]> {
      const records: unknown[] = [];
      let requestedPage = 1;

      try {
        while (true) {
          const result = pageSchema.parse(
            await gateway.listEntries(requestedPage, 200),
          );
          records.push(...result.items);
          if (requestedPage >= result.totalPages) {
            break;
          }
          requestedPage += 1;
        }

        return records
          .map((record) => mapPocketBaseEntry(record))
          .sort((left, right) => left.id.localeCompare(right.id));
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new PocketBaseSourceError("pocketbase.response");
        }
        throw toPocketBaseSourceError(error);
      }
    },
  };
}
