import rehypeShiki from "@shikijs/rehype";
import type { Element, Root } from "hast";
import { unified } from "unified";
import { visit } from "unist-util-visit";

import {
  codeLanguage,
  isSupportedCodeLanguage,
  type SupportedCodeLanguage,
} from "../code-languages.js";
import type { ContentPlugin } from "../types.js";

function normalizeLanguageClass(node: Element, language: string): void {
  const classes = Array.isArray(node.properties.className)
    ? node.properties.className.map(String)
    : [];
  node.properties.className = [
    ...classes.filter((value) => !/^(?:language|lang)-/u.test(value)),
    `language-${language}`,
  ];
}

export function createCodeHighlightingPlugin(
  corpusLanguages: ReadonlySet<string>,
): ContentPlugin {
  const languages = [...corpusLanguages]
    .filter(isSupportedCodeLanguage)
    .sort() as SupportedCodeLanguage[];
  const highlighter = unified().use(rehypeShiki, {
    theme: "github-light-default",
    langs: languages,
    addLanguageClass: true,
    stripEndNewline: false,
  });

  return {
    name: "code-highlighting",
    after: ["prose-normalization"],
    async transform(tree, context) {
      visit(tree, "element", (node, _index, parent) => {
        if (
          node.tagName !== "code" ||
          parent?.type !== "element" ||
          parent.tagName !== "pre"
        ) {
          return;
        }

        const language = codeLanguage(node);
        if (language === null) {
          return;
        }
        normalizeLanguageClass(node, language);
        if (!languages.includes(language as SupportedCodeLanguage)) {
          context.diagnostics.warning({
            category: "content",
            code: "content.unknown-code-language",
            message: `Unknown code language ${JSON.stringify(language)}; preserved as plain code.`,
            recordId: context.recordId,
            stage: "code-highlighting",
          });
        }
      });

      const transformed = (await highlighter.run(tree)) as Root;
      if (transformed !== tree) {
        tree.children = transformed.children;
        tree.data = transformed.data;
      }
    },
  };
}
