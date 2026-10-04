import type { Diagnostic } from "../diagnostics.js";

export interface BuildCliArguments {
  command: "build";
  source: string;
  out: string;
  siteOrigin: string;
  allowedWarnings: Set<string>;
}

function requireValue(
  args: readonly string[],
  index: number,
  flag: string,
): string {
  const value = args[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new TypeError(`${flag} requires a value.`);
  }
  return value;
}

function parseSiteOrigin(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new TypeError("--site-origin must be an absolute HTTP(S) origin.");
  }
  if (
    (url.protocol !== "https:" && url.protocol !== "http:") ||
    url.username.length > 0 ||
    url.password.length > 0 ||
    url.pathname !== "/" ||
    url.search.length > 0 ||
    url.hash.length > 0
  ) {
    throw new TypeError("--site-origin must be an absolute HTTP(S) origin.");
  }
  return url.origin;
}

export function parseCliArguments(args: readonly string[]): BuildCliArguments {
  if (args[0] !== "build") {
    throw new TypeError("Expected the build command.");
  }

  let source: string | undefined;
  let out: string | undefined;
  let siteOrigin: string | undefined;
  const allowedWarnings = new Set<string>();

  for (let index = 1; index < args.length; index += 2) {
    const flag = args[index];
    const value = requireValue(args, index, flag ?? "argument");
    if (flag === "--source") {
      source = value;
    } else if (flag === "--out") {
      out = value;
    } else if (flag === "--site-origin") {
      siteOrigin = parseSiteOrigin(value);
    } else if (flag === "--allow-warning") {
      allowedWarnings.add(value);
    } else {
      throw new TypeError(`Unknown argument ${JSON.stringify(flag)}.`);
    }
  }

  if (source === undefined) {
    throw new TypeError("--source is required.");
  }
  if (out === undefined) {
    throw new TypeError("--out is required.");
  }
  if (siteOrigin === undefined) {
    throw new TypeError("--site-origin is required.");
  }
  return { command: "build", source, out, siteOrigin, allowedWarnings };
}

export function unexpectedDiagnostics(
  diagnostics: readonly Diagnostic[],
  allowedWarnings: ReadonlySet<string>,
): Diagnostic[] {
  return diagnostics.filter(
    (diagnostic) =>
      diagnostic.severity === "error" || !allowedWarnings.has(diagnostic.code),
  );
}
