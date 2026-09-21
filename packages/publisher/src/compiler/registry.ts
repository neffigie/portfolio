import { createCodeHighlightingPlugin } from "./plugins/code.js";
import { headingAnchorsPlugin } from "./plugins/headings.js";
import { linkClassificationPlugin } from "./plugins/links.js";
import { proseNormalizationPlugin } from "./plugins/prose.js";
import { semanticStructuresPlugin } from "./plugins/structures.js";
import type { ContentPlugin } from "./types.js";

export const CORE_CONTENT_PLUGINS: readonly ContentPlugin[] = [
  proseNormalizationPlugin,
  headingAnchorsPlugin,
  linkClassificationPlugin,
  semanticStructuresPlugin,
];

export function createContentPlugins(
  corpusLanguages: ReadonlySet<string>,
): ContentPlugin[] {
  return [
    proseNormalizationPlugin,
    createCodeHighlightingPlugin(corpusLanguages),
    headingAnchorsPlugin,
    linkClassificationPlugin,
    semanticStructuresPlugin,
  ];
}

export function orderPlugins(
  plugins: readonly ContentPlugin[],
): ContentPlugin[] {
  const pluginsByName = new Map<string, ContentPlugin>();

  for (const plugin of plugins) {
    if (pluginsByName.has(plugin.name)) {
      throw new TypeError(`Duplicate content plugin name: ${plugin.name}.`);
    }
    pluginsByName.set(plugin.name, plugin);
  }

  for (const plugin of plugins) {
    for (const predecessor of plugin.after ?? []) {
      if (!pluginsByName.has(predecessor)) {
        throw new TypeError(
          `Content plugin ${plugin.name} requires unregistered predecessor ${predecessor}.`,
        );
      }
    }
  }

  const ordered: ContentPlugin[] = [];
  const complete = new Set<string>();

  while (ordered.length < plugins.length) {
    const next = plugins.find(
      (plugin) =>
        !complete.has(plugin.name) &&
        (plugin.after ?? []).every((name) => complete.has(name)),
    );

    if (next === undefined) {
      const unresolved = plugins
        .filter((plugin) => !complete.has(plugin.name))
        .map(({ name }) => name)
        .join(", ");
      throw new TypeError(
        `Content plugin ordering cycle among: ${unresolved}.`,
      );
    }

    ordered.push(next);
    complete.add(next.name);
  }

  return ordered;
}
