import type { Element, ElementContent, Properties, Root } from "hast";
import { visit } from "unist-util-visit";

import type { CompilationContext, ContentPlugin } from "../types.js";

const bareHttpUrl = /https?:\/\/[^\s<>"']*[^\s<>"'.,;:!?()[\]{}]/giu;
const linkificationBoundaries = new Set([
  "a",
  "code",
  "pre",
  "script",
  "style",
]);

function linkifyText(value: string): ElementContent[] {
  const children: ElementContent[] = [];
  let cursor = 0;

  for (const match of value.matchAll(bareHttpUrl)) {
    const href = match[0];
    const start = match.index;
    if (start > cursor) {
      children.push({ type: "text", value: value.slice(cursor, start) });
    }
    children.push({
      type: "element",
      tagName: "a",
      properties: { href },
      children: [{ type: "text", value: href }],
    });
    cursor = start + href.length;
  }

  if (cursor === 0) return [{ type: "text", value }];
  if (cursor < value.length) {
    children.push({ type: "text", value: value.slice(cursor) });
  }
  return children;
}

function linkifyBareUrls(parent: Root | Element, blocked = false): void {
  const children: ElementContent[] = [];

  for (const child of parent.children) {
    if (child.type === "text" && !blocked) {
      children.push(...linkifyText(child.value));
      continue;
    }
    if (child.type === "element") {
      linkifyBareUrls(
        child,
        blocked || linkificationBoundaries.has(child.tagName),
      );
    }
    children.push(child as ElementContent);
  }

  parent.children = children as typeof parent.children;
}

function relationshipTokens(properties: Properties): string[] {
  const value = properties.rel;
  if (Array.isArray(value)) {
    return value.map(String);
  }
  return [];
}

function secureExternalLink(node: Element): void {
  const rel = relationshipTokens(node.properties);
  for (const required of ["noopener", "noreferrer"]) {
    if (!rel.includes(required)) {
      rel.push(required);
    }
  }
  node.properties.dataLinkKind = "external";
  node.properties.rel = rel;
  node.children.push({
    type: "element",
    tagName: "span",
    properties: {
      className: ["external-link-icon"],
      ariaHidden: "true",
    },
    children: [],
  });
}

function rejectLink(
  node: Element,
  context: CompilationContext,
  message: string,
): void {
  delete node.properties.href;
  context.diagnostics.error({
    category: "content",
    code: "content.invalid-link",
    message,
    recordId: context.recordId,
    stage: "link-classification",
  });
}

export const linkClassificationPlugin: ContentPlugin = {
  name: "link-classification",
  after: ["prose-normalization"],
  transform(tree, context) {
    linkifyBareUrls(tree);
    const siteOrigin = new URL(context.siteOrigin).origin;

    visit(tree, "element", (node) => {
      if (node.tagName !== "a" || typeof node.properties.href !== "string") {
        return;
      }

      const href = node.properties.href.trim();
      let resolved: URL;
      try {
        resolved = new URL(href, context.siteOrigin);
      } catch {
        rejectLink(
          node,
          context,
          `Could not resolve link target ${JSON.stringify(href)}.`,
        );
        return;
      }

      if (resolved.protocol === "javascript:") {
        rejectLink(
          node,
          context,
          "Removed a javascript link target from authored content.",
        );
        return;
      }

      if (resolved.protocol !== "http:" && resolved.protocol !== "https:") {
        return;
      }

      if (resolved.origin === siteOrigin) {
        node.properties.dataLinkKind = "internal";
      } else {
        secureExternalLink(node);
      }
    });
  },
};
