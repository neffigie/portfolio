import type { Element, Parents, Properties } from "hast";
import { visit } from "unist-util-visit";

import type { MediaManifestEntry } from "../../model.js";
import type { CompilationContext, ContentPlugin } from "../types.js";

interface PendingImage {
  node: Element;
  parent: Parents;
  index: number;
  requestId: string;
}

function imageProperties(
  authored: Properties,
  media: MediaManifestEntry,
  context: CompilationContext,
): Properties {
  const properties = { ...authored };
  const hasAlt = Object.hasOwn(properties, "alt");
  const alt =
    typeof properties.alt === "string"
      ? properties.alt
      : properties.alt == null
        ? ""
        : String(properties.alt);
  if (!hasAlt) {
    context.diagnostics.warning({
      category: "content",
      code: "content.missing-image-alt",
      message: "Image is missing authored alternative text.",
      recordId: context.recordId,
      stage: "responsive-images",
    });
  }

  delete properties.src;
  delete properties.srcSet;
  delete properties.width;
  delete properties.height;
  properties.src = media.fallbackPath;
  properties.alt = alt;
  properties.width = media.width;
  properties.height = media.height;
  return properties;
}

function renderPicture(
  authored: Element,
  media: MediaManifestEntry,
  context: CompilationContext,
): Element {
  const children: Element[] = [];
  if (media.variants.length > 0) {
    children.push({
      type: "element",
      tagName: "source",
      properties: {
        type: "image/webp",
        srcSet: media.variants
          .map(({ path, width }) => `${path} ${width}w`)
          .join(", "),
      },
      children: [],
    });
  }
  children.push({
    type: "element",
    tagName: "img",
    properties: imageProperties(authored.properties, media, context),
    children: [],
  });
  return {
    type: "element",
    tagName: "picture",
    properties: {},
    children,
  };
}

export const responsiveImagesPlugin: ContentPlugin = {
  name: "responsive-images",
  after: ["prose-normalization"],
  async transform(tree, context) {
    const pending: PendingImage[] = [];

    visit(tree, "element", (node, index, parent) => {
      if (
        node.tagName !== "img" ||
        index === undefined ||
        parent === undefined
      ) {
        return;
      }
      if (typeof node.properties.src !== "string") {
        context.diagnostics.error({
          category: "content",
          code: "content.invalid-image-source",
          message: "Image is missing a usable source URL.",
          recordId: context.recordId,
          stage: "responsive-images",
        });
        return;
      }

      pending.push({
        node,
        parent,
        index,
        requestId: context.media.request({ source: node.properties.src }),
      });
    });

    const resolved = await Promise.all(
      pending.map(({ requestId }) => context.media.resolve(requestId)),
    );
    for (const [position, image] of pending.entries()) {
      const media = resolved[position];
      if (media !== undefined) {
        image.parent.children[image.index] = renderPicture(
          image.node,
          media,
          context,
        );
      }
    }
  },
};
