import { describe, expect, it } from "vitest";

import { parseCliArguments, unexpectedDiagnostics } from "../src/cli.js";

describe("publisher CLI", () => {
  it("parses explicit build inputs and repeated warning allowances", () => {
    expect(
      parseCliArguments([
        "build",
        "--source",
        "source.json",
        "--out",
        ".build/publication",
        "--site-origin",
        "https://neffigie.dev",
        "--allow-warning",
        "content.missing-image-alt",
        "--allow-warning",
        "content.unknown-code-language",
      ]),
    ).toEqual({
      command: "build",
      source: "source.json",
      out: ".build/publication",
      siteOrigin: "https://neffigie.dev",
      allowedWarnings: new Set([
        "content.missing-image-alt",
        "content.unknown-code-language",
      ]),
    });
  });

  it.each([
    [[], "build command"],
    [["build", "--source", "source.json", "--out", "out"], "site-origin"],
    [
      [
        "build",
        "--source",
        "source.json",
        "--out",
        "out",
        "--site-origin",
        "https://example.com/path",
      ],
      "origin",
    ],
    [
      [
        "build",
        "--source",
        "source.json",
        "--out",
        "out",
        "--site-origin",
        "https://example.com",
        "--endpoint",
        "https://production.example.com",
      ],
      "Unknown argument",
    ],
  ])("rejects incomplete or implicit configuration", (args, message) => {
    expect(() => parseCliArguments(args)).toThrow(message);
  });

  it("fails only errors and warning codes that were not enumerated", () => {
    const diagnostics = [
      {
        severity: "warning" as const,
        category: "content" as const,
        code: "content.missing-image-alt",
        message: "Missing alt.",
        stage: "responsive-images",
      },
      {
        severity: "warning" as const,
        category: "content" as const,
        code: "content.unknown-code-language",
        message: "Unknown language.",
        stage: "code-highlighting",
      },
      {
        severity: "error" as const,
        category: "publication" as const,
        code: "publication.failed",
        message: "Failed.",
        stage: "publication",
      },
    ];

    expect(
      unexpectedDiagnostics(
        diagnostics,
        new Set(["content.missing-image-alt"]),
      ).map(({ code }) => code),
    ).toEqual(["content.unknown-code-language", "publication.failed"]);
  });
});
