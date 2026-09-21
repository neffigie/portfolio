import type { MediaPolicy } from "./types.js";

export const DEFAULT_MEDIA_POLICY: MediaPolicy = Object.freeze({
  widths: Object.freeze([480, 960, 1440]),
  webpQuality: 82,
  jpegFallbackQuality: 95,
});
