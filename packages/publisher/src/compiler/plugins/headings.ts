import type { Element, Properties } from "hast";
import { toText } from "hast-util-to-text";
import { visit } from "unist-util-visit";

import { canonicalizeSlug } from "../../routes.js";
import type { ContentPlugin } from "../types.js";

const headingNames = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);
const validAuthoredId = /^[A-Za-z][A-Za-z0-9:._-]*$/u;

function classList(properties: Properties): string[] {
  const value = properties.className;
  if (Array.isArray(value)) {
    return value.map(String);
  }
  return [];
}

function isGeneratedAnchor(node: Element): boolean {
  return (
    node.tagName === "a" &&
    classList(node.properties).includes("heading-anchor")
  );
}

function uniqueId(base: string, seen: Set<string>): string {
  let candidate = base;
  let suffix = 2;
  while (seen.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export const headingAnchorsPlugin: ContentPlugin = {
  name: "heading-anchors",
  after: ["prose-normalization"],
  transform(tree) {
    const seen = new Set<string>();

    visit(tree, "element", (node) => {
      if (!headingNames.has(node.tagName)) {
        return;
      }

      node.children = node.children.filter(
        (child) => child.type !== "element" || !isGeneratedAnchor(child),
      );
      const label = toText(node).replace(/\s+/gu, " ").trim();
      const authoredId =
        typeof node.properties.id === "string" ? node.properties.id : null;
      const base =
        authoredId !== null &&
        validAuthoredId.test(authoredId) &&
        !seen.has(authoredId)
          ? authoredId
          : canonicalizeSlug(label) || "section";
      const id = uniqueId(base, seen);
      seen.add(id);
      node.properties.id = id;
      node.children.push({
        type: "element",
        tagName: "a",
        properties: {
          className: ["heading-anchor"],
          href: `#${id}`,
          ariaLabel: `Link to ${label || "section"}`,
        },
        children: [{ type: "text", value: "#" }],
      });
    });
  },
};
