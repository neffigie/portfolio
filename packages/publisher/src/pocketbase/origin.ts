export function normalizePocketBaseOrigin(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new TypeError("PocketBase URL must be a valid HTTP(S) origin.");
  }
  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.username !== "" ||
    url.password !== "" ||
    url.pathname !== "/" ||
    url.search !== "" ||
    url.hash !== ""
  ) {
    throw new TypeError(
      "PocketBase URL must be an HTTP(S) origin without credentials, path, query, or fragment.",
    );
  }
  return url.origin;
}
