import type { Element, Parents } from "hast";

import type { ContentPlugin } from "../types.js";

function classes(node: Element): string[] {
  return Array.isArray(node.properties.className)
    ? node.properties.className.map(String)
    : [];
}

function isTableWrapper(node: Parents): boolean {
  return (
    node.type === "element" &&
    node.tagName === "div" &&
    classes(node).includes("table-scroll")
  );
}

function firstRow(node: Element): Element | null {
  for (const child of node.children) {
    if (child.type !== "element") {
      continue;
    }
    if (child.tagName === "tr") {
      return child;
    }
    const nested = firstRow(child);
    if (nested !== null) {
      return nested;
    }
  }
  return null;
}

function addColumnScope(table: Element): void {
  const row = firstRow(table);
  if (row === null) {
    return;
  }

  for (const child of row.children) {
    if (child.type === "element" && child.tagName === "th") {
      child.properties.scope ??= "col";
    }
  }
}

function transformTables(parent: Parents): void {
  for (let index = 0; index < parent.children.length; index += 1) {
    const child = parent.children[index];
    if (child?.type !== "element") {
      continue;
    }

    if (child.tagName === "table") {
      addColumnScope(child);
      if (!isTableWrapper(parent)) {
        parent.children[index] = {
          type: "element",
          tagName: "div",
          properties: {
            className: ["table-scroll"],
            tabIndex: 0,
            role: "region",
            ariaLabel: "Scrollable table",
          },
          children: [child],
        };
      }
      continue;
    }

    transformTables(child);
  }
}

export const semanticStructuresPlugin: ContentPlugin = {
  name: "semantic-structures",
  after: ["prose-normalization"],
  transform(tree) {
    transformTables(tree);
  },
};
