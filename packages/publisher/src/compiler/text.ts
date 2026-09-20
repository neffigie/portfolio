import type { Element, Parents, Root } from "hast";
import { toText } from "hast-util-to-text";

function classList(node: Element): string[] {
  const value = node.properties.className;
  if (Array.isArray(value)) {
    return value.map(String);
  }
  return [];
}

function removeGeneratedText(parent: Parents): void {
  parent.children = parent.children.filter(
    (child) =>
      child.type !== "element" || !classList(child).includes("heading-anchor"),
  ) as typeof parent.children;

  for (const child of parent.children) {
    if (child.type === "element") {
      removeGeneratedText(child);
    }
  }
}

export function extractSearchableText(tree: Root): string {
  const searchableTree = structuredClone(tree);
  removeGeneratedText(searchableTree);
  return toText(searchableTree).replace(/\s+/gu, " ").trim();
}
