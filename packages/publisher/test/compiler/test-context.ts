import {
  type CompilationContext,
  DiagnosticCollector,
} from "../../src/index.js";

export function createCompilationContext(
  overrides: Partial<CompilationContext> = {},
): CompilationContext {
  return {
    recordId: "entry-1",
    route: "/entry-1",
    siteOrigin: "https://neffigie.dev",
    diagnostics: new DiagnosticCollector(),
    media: { requestIds: () => [] },
    ...overrides,
  };
}
