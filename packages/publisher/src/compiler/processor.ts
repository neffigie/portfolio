import type { Element, Root, RootContent } from "hast";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";

import { orderPlugins } from "./registry.js";
import { extractSearchableText } from "./text.js";
import type {
  CompilationContext,
  CompiledDocument,
  ContentPlugin,
} from "./types.js";

const parser = unified().use(rehypeParse, { fragment: true });
const serializer = unified().use(rehypeStringify);

type RuntimeChild = RootContent | Root;

function flattenFragmentRoots(parent: Root | Element): void {
  const flattened: RootContent[] = [];

  for (const child of parent.children as RuntimeChild[]) {
    if (child.type === "root") {
      flattenFragmentRoots(child);
      flattened.push(...child.children);
      continue;
    }
    if (child.type === "element") {
      flattenFragmentRoots(child);
    }
    flattened.push(child);
  }

  parent.children = flattened as typeof parent.children;
}

export async function compileDocument(
  html: string,
  context: CompilationContext,
  plugins: readonly ContentPlugin[],
): Promise<CompiledDocument> {
  const tree = parser.parse(html) as Root;

  for (const plugin of orderPlugins(plugins)) {
    await plugin.transform(tree, context);
    flattenFragmentRoots(tree);
  }

  return {
    html: serializer.stringify(tree),
    searchableText: extractSearchableText(tree),
    mediaRequestIds: [...context.media.requestIds()],
  };
}
