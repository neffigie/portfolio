export type DiagnosticCategory =
  | "source"
  | "schema"
  | "route"
  | "content"
  | "media"
  | "search"
  | "site"
  | "publication";

export interface Diagnostic {
  severity: "warning" | "error";
  category: DiagnosticCategory;
  code: string;
  message: string;
  recordId?: string;
  stage: string;
}

export type DiagnosticInput = Omit<Diagnostic, "severity">;

function redactSensitive(value: string): string {
  return value
    .replace(/\/\/[^\s/:]+:[^\s/@]+@/gu, "//[redacted]@")
    .replace(/\bBearer\s+[^\s,;]+/giu, "Bearer [redacted]")
    .replace(
      /\b(password|token|secret|api[_-]?key)\s*([=:])\s*[^\s,;]+/giu,
      "$1$2[redacted]",
    );
}

export function formatDiagnostics(diagnostics: readonly Diagnostic[]): string {
  return diagnostics
    .map((diagnostic) => {
      const record =
        diagnostic.recordId === undefined
          ? ""
          : ` record=${diagnostic.recordId}`;
      return `[${diagnostic.severity}] ${diagnostic.category}/${diagnostic.code} stage=${diagnostic.stage}${record}: ${redactSensitive(diagnostic.message)}`;
    })
    .join("\n");
}

export class CompilationFailure extends Error {
  readonly diagnostics: readonly Diagnostic[];

  constructor(diagnostics: readonly Diagnostic[]) {
    super(formatDiagnostics(diagnostics));
    this.name = "CompilationFailure";
    this.diagnostics = diagnostics.map((diagnostic) => ({ ...diagnostic }));
  }
}

export class DiagnosticCollector {
  readonly #items: Diagnostic[] = [];

  get items(): readonly Diagnostic[] {
    return this.#items.map((diagnostic) => ({ ...diagnostic }));
  }

  get hasErrors(): boolean {
    return this.#items.some((diagnostic) => diagnostic.severity === "error");
  }

  warning(input: DiagnosticInput): void {
    this.#items.push({ severity: "warning", ...input });
  }

  error(input: DiagnosticInput): void {
    this.#items.push({ severity: "error", ...input });
  }

  throwIfErrors(): void {
    if (this.hasErrors) {
      throw new CompilationFailure(
        this.#items.filter((diagnostic) => diagnostic.severity === "error"),
      );
    }
  }
}
