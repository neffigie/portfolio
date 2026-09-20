import { describe, expect, it } from "vitest";

import {
  CompilationFailure,
  DiagnosticCollector,
  formatDiagnostics,
} from "../src/index.js";

describe("DiagnosticCollector", () => {
  it("retains structured warning context without treating it as a failure", () => {
    const collector = new DiagnosticCollector();

    collector.warning({
      category: "content",
      code: "content.unknown-code-language",
      message: "Unknown language: madeup",
      recordId: "entry-1",
      stage: "code-highlighting",
    });

    expect(collector.hasErrors).toBe(false);
    expect(collector.items).toEqual([
      {
        severity: "warning",
        category: "content",
        code: "content.unknown-code-language",
        message: "Unknown language: madeup",
        recordId: "entry-1",
        stage: "code-highlighting",
      },
    ]);
    expect(() => collector.throwIfErrors()).not.toThrow();
  });

  it("throws one CompilationFailure containing every error diagnostic", () => {
    const collector = new DiagnosticCollector();
    collector.error({
      category: "schema",
      code: "schema.published-field",
      message: "Published entry is missing a summary.",
      recordId: "entry-1",
      stage: "normalization",
    });

    expect(() => collector.throwIfErrors()).toThrow(CompilationFailure);

    try {
      collector.throwIfErrors();
    } catch (error) {
      expect(error).toBeInstanceOf(CompilationFailure);
      expect((error as CompilationFailure).diagnostics).toEqual(
        collector.items,
      );
    }
  });

  it("redacts credentials and tokens when formatting diagnostics", () => {
    const collector = new DiagnosticCollector();
    collector.error({
      category: "source",
      code: "source.request-failed",
      message:
        "Request https://anna:secret-password@cms.invalid failed with Bearer abc.def.ghi and token=private-token",
      stage: "source-fetch",
    });

    const output = formatDiagnostics(collector.items);

    expect(output).toContain("source.request-failed");
    expect(output).not.toContain("secret-password");
    expect(output).not.toContain("abc.def.ghi");
    expect(output).not.toContain("private-token");
  });
});
