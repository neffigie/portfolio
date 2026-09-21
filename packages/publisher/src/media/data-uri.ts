export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type SupportedImageMimeType =
  (typeof SUPPORTED_IMAGE_MIME_TYPES)[number];

export interface DecodedDataUri {
  bytes: Uint8Array;
  mimeType: SupportedImageMimeType;
}

export class DataUriError extends TypeError {
  constructor(
    readonly code: "media.source-invalid" | "media.unsupported-type",
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "DataUriError";
  }
}

function isSupportedMimeType(value: string): value is SupportedImageMimeType {
  return (SUPPORTED_IMAGE_MIME_TYPES as readonly string[]).includes(value);
}

function decodeBase64(value: string): Uint8Array {
  const normalized = value.replace(/\s+/gu, "");
  if (
    normalized.length === 0 ||
    normalized.length % 4 !== 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(
      normalized,
    )
  ) {
    throw new DataUriError(
      "media.source-invalid",
      "Data URI contains malformed or empty base64 data.",
    );
  }
  return Buffer.from(normalized, "base64");
}

function decodePercentEncoded(value: string): Uint8Array {
  if (value.length === 0) {
    throw new DataUriError(
      "media.source-invalid",
      "Data URI contains no data.",
    );
  }
  try {
    return new TextEncoder().encode(decodeURIComponent(value));
  } catch (error) {
    throw new DataUriError(
      "media.source-invalid",
      "Data URI contains malformed percent encoding.",
      { cause: error },
    );
  }
}

export function decodeDataUri(value: string): DecodedDataUri {
  const match = /^data:([^;,]+)((?:;[^,]*)*),(.*)$/isu.exec(value);
  if (match === null) {
    throw new DataUriError(
      "media.source-invalid",
      "Value is not a valid data URI.",
    );
  }
  const [, rawMimeType, rawParameters = "", payload] = match;
  if (!rawMimeType || payload === undefined) {
    throw new DataUriError(
      "media.source-invalid",
      "Value is not a valid data URI.",
    );
  }

  const mimeType = rawMimeType.toLowerCase();
  if (!isSupportedMimeType(mimeType)) {
    throw new DataUriError(
      "media.unsupported-type",
      `Unsupported data URI MIME type: ${mimeType}.`,
    );
  }

  const parameters = rawParameters
    .split(";")
    .map((parameter) => parameter.toLowerCase());
  const bytes = parameters.includes("base64")
    ? decodeBase64(payload)
    : decodePercentEncoded(payload);
  return { bytes, mimeType };
}
