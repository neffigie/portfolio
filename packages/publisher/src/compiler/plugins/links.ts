import type { Element, Properties } from "hast";
import { visit } from "unist-util-visit";

import type { CompilationContext, ContentPlugin } from "../types.js";

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
