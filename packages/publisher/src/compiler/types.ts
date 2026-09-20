import type { Root } from "hast";

import type { DiagnosticCollector } from "../diagnostics.js";

export interface MediaRequestCollector {
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
