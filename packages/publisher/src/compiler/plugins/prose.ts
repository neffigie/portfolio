import type { Element, ElementContent, Parents, RootContent } from "hast";
import { toText } from "hast-util-to-text";

import type { CompilationContext, ContentPlugin } from "../types.js";

const headingNames = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);
const blockNames = new Set([
  "address",
  "article",
  "aside",
  "blockquote",
  "details",
  "div",
  "dl",
  "fieldset",
  "figure",
  "footer",
  "form",
  "header",
  "hgroup",
  "hr",
  "main",
  "nav",
  "ol",
  "p",
  "pre",
  "section",
  "table",
  "ul",
]);
const embeddedContentNames = new Set([
  "audio",
  "canvas",
  "embed",
  "iframe",
  "img",
  "input",
  "object",
  "picture",
  "svg",
  "video",
]);

function reportCorrection(context: CompilationContext, message: string): void {
  context.diagnostics.warning({
    category: "content",
    code: "content.normalized-editor-structure",
    message,
    recordId: context.recordId,
    stage: "prose-normalization",
  });
}

function hasEmbeddedContent(node: Element): boolean {
  return node.children.some(
    (child) =>
      child.type === "element" &&
      (embeddedContentNames.has(child.tagName) || hasEmbeddedContent(child)),
  );
}

function isBlankEditorBlock(node: Element): boolean {
  return (
    (node.tagName === "p" || headingNames.has(node.tagName)) &&
    toText(node).trim().length === 0 &&
    !hasEmbeddedContent(node)
  );
}

function hasBlockChild(node: Element): boolean {
  return node.children.some(
    (child) => child.type === "element" && blockNames.has(child.tagName),
  );
}

function normalizeChildren(parent: Parents, context: CompilationContext): void {
  const children: Array<RootContent | ElementContent> = [];

  for (const child of parent.children) {
    if (child.type === "element") {
      normalizeChildren(child, context);

      if (isBlankEditorBlock(child)) {
        reportCorrection(
          context,
          `Removed an empty editor ${child.tagName} element.`,
        );
        continue;
      }

      if (child.tagName === "p" && hasBlockChild(child)) {
        reportCorrection(
          context,
          "Unwrapped a paragraph containing block-level content.",
        );
        children.push(...child.children);
        continue;
      }
    }

    children.push(child);
  }

  if (parent.type === "root") {
    while (
      children[0]?.type === "text" &&
      children[0].value.trim().length === 0
    ) {
      children.shift();
    }
    while (
      children.at(-1)?.type === "text" &&
      (children.at(-1) as { value: string }).value.trim().length === 0
    ) {
      children.pop();
    }
  }

  parent.children = children as typeof parent.children;
}

export const proseNormalizationPlugin: ContentPlugin = {
  name: "prose-normalization",
  transform(tree, context) {
    normalizeChildren(tree, context);
  },
};
