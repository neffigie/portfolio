import type { Root } from "hast";
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

export async function compileDocument(
  html: string,
  context: CompilationContext,
  plugins: readonly ContentPlugin[],
): Promise<CompiledDocument> {
  const tree = parser.parse(html) as Root;

  for (const plugin of orderPlugins(plugins)) {
    await plugin.transform(tree, context);
  }

  return {
    html: serializer.stringify(tree),
    searchableText: extractSearchableText(tree),
    mediaRequestIds: [...context.media.requestIds()],
  };
}
