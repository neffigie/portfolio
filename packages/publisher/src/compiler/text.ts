import type { Root } from "hast";
import { toText } from "hast-util-to-text";

export function extractSearchableText(tree: Root): string {
  return toText(tree).replace(/\s+/gu, " ").trim();
}
