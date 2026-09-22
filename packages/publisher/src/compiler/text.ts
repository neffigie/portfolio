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

const nonProseContainers = new Set([
  "figure",
  "figcaption",
  "pre",
  "code",
  "table",
]);

export function extractOpeningPreview(tree: Root): string {
  function hasProseText(parent: Element): boolean {
    return parent.children.some((child) => {
      if (child.type === "text") return child.value.trim().length > 0;
      return (
        child.type === "element" &&
        !nonProseContainers.has(child.tagName) &&
        hasProseText(child)
      );
    });
  }

  function visit(parent: Root | Element): string {
    for (const child of parent.children) {
      if (child.type !== "element" || nonProseContainers.has(child.tagName)) {
        continue;
      }
      if (child.tagName === "p" && hasProseText(child)) {
        const text = toText(child).replace(/\s+/gu, " ").trim();
        if (text) return text;
      }
      const nested = visit(child);
      if (nested) return nested;
    }
    return "";
  }

  return visit(tree);
}
