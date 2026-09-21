import type { Element, Root } from "hast";
import rehypeParse from "rehype-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

const parser = unified().use(rehypeParse, { fragment: true });

export const CODE_LANGUAGE_ALIASES = {
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
} as const;

export const SUPPORTED_CODE_LANGUAGES = ["javascript", "typescript"] as const;
export type SupportedCodeLanguage = (typeof SUPPORTED_CODE_LANGUAGES)[number];

export function normalizeCodeLanguage(value: string): string {
  const key = value.trim().toLowerCase();
  return (
    CODE_LANGUAGE_ALIASES[key as keyof typeof CODE_LANGUAGE_ALIASES] ?? key
  );
}

export function codeLanguage(node: Element): string | null {
  const classes = node.properties.className;
  if (!Array.isArray(classes)) {
    return null;
  }

  for (const value of classes) {
    const className = String(value);
    const match = /^(?:language|lang)-(.+)$/u.exec(className);
    if (match?.[1]) {
      return normalizeCodeLanguage(match[1]);
    }
  }
  return null;
}

export function detectCorpusLanguages(
  htmlDocuments: readonly string[],
): Set<string> {
  const languages = new Set<string>();

  for (const html of htmlDocuments) {
    const tree = parser.parse(html) as Root;
    visit(tree, "element", (node, _index, parent) => {
      if (
        node.tagName !== "code" ||
        parent?.type !== "element" ||
        parent.tagName !== "pre"
      ) {
        return;
      }
      const language = codeLanguage(node);
      if (language !== null) {
        languages.add(language);
      }
    });
  }

  return languages;
}

export function isSupportedCodeLanguage(
  value: string,
): value is SupportedCodeLanguage {
  return (SUPPORTED_CODE_LANGUAGES as readonly string[]).includes(value);
}
