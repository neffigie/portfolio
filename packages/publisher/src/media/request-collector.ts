import type { MediaRequest, MediaRequestCollector } from "../compiler/types.js";
import type { DiagnosticCollector } from "../diagnostics.js";
import type { MediaResolver } from "./resolver.js";
import type { MediaSource, MediaSourceResolver } from "./types.js";

export class ResolvingMediaCollector implements MediaRequestCollector {
  readonly #sources = new Map<string, string>();
  readonly #resolutions = new Map<
    string,
    ReturnType<MediaResolver["resolve"]>
  >();
  #nextRequest = 1;

  constructor(
    readonly ownerId: string,
    readonly resolver: MediaResolver,
    readonly sourceResolver: MediaSourceResolver,
    readonly diagnostics: DiagnosticCollector,
  ) {}

  request(request: MediaRequest): string {
    const requestId = `media-${this.#nextRequest}`;
    this.#nextRequest += 1;
    this.#sources.set(requestId, request.source);
    return requestId;
  }

  resolve(requestId: string): ReturnType<MediaResolver["resolve"]> {
    const existing = this.#resolutions.get(requestId);
    if (existing !== undefined) {
      return existing;
    }
    const source = this.#sources.get(requestId);
    if (source === undefined) {
      return Promise.reject(
        new TypeError(`Unknown media request ${JSON.stringify(requestId)}.`),
      );
    }

    let resolvedSource: MediaSource;
    try {
      resolvedSource = this.sourceResolver(source, this.ownerId);
    } catch (error) {
      this.diagnostics.error({
        category: "media",
        code: "media.source-invalid",
        message: `Could not interpret media source: ${String(error)}`,
        recordId: this.ownerId,
        stage: "media-resolution",
      });
      return Promise.reject(error);
    }
    const pending = this.resolver.resolve(resolvedSource, this.ownerId);
    this.#resolutions.set(requestId, pending);
    return pending;
  }

  requestIds(): readonly string[] {
    return [...this.#sources.keys()];
  }
}
