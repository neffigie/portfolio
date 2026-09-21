import type { Root } from "hast";

import type { DiagnosticCollector } from "../diagnostics.js";
import type { MediaManifestEntry } from "../model.js";

export interface MediaRequest {
  source: string;
}

export interface MediaRequestCollector {
  request(request: MediaRequest): string;
  resolve(requestId: string): Promise<MediaManifestEntry>;
  requestIds(): readonly string[];
}

export interface CompilationContext {
  recordId: string;
  route: string;
  siteOrigin: string;
  diagnostics: DiagnosticCollector;
  media: MediaRequestCollector;
}

export interface ContentPlugin {
  name: string;
  after?: readonly string[];
  transform(tree: Root, context: CompilationContext): void | Promise<void>;
}

export interface CompiledDocument {
  html: string;
  searchableText: string;
  mediaRequestIds: string[];
}
