import { spawnSync } from "node:child_process";

const hugo = process.env.HUGO_BINARY ?? "hugo";
const result = spawnSync(
  hugo,
  [
    "--source",
    "site",
    "--destination",
    "public",
    "--cleanDestinationDir",
    "--minify",
    "--panicOnWarning",
    "--printPathWarnings",
  ],
  { stdio: "inherit" },
);

if (result.error !== undefined) {
  throw result.error;
}
process.exitCode = result.status ?? 1;
