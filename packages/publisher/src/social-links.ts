import {
  type SocialLink,
  SocialLinkSchema,
  type SourceSocialLink,
} from "./model.js";
import { compareText } from "./ordering.js";

export function prepareSocialLinks(
  sourceLinks: readonly SourceSocialLink[],
): SocialLink[] {
  const enabled = sourceLinks.filter(({ enabled }) => enabled);
  const services = new Set<string>();
  const orders = new Set<number>();

  for (const link of enabled) {
    if (services.has(link.service)) {
      throw new TypeError(`Duplicate social service ${link.service}.`);
    }
    if (orders.has(link.sortOrder)) {
      throw new TypeError(`Duplicate social sort order ${link.sortOrder}.`);
    }
    services.add(link.service);
    orders.add(link.sortOrder);
  }

  return enabled
    .map(({ service, label, href, sortOrder }) =>
      SocialLinkSchema.parse({ service, label, href, sortOrder }),
    )
    .sort(
      (left, right) =>
        left.sortOrder - right.sortOrder ||
        compareText(left.service, right.service),
    );
}
