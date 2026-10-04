import { z } from "zod";

import type { PocketBaseCredentials } from "./client.js";
import { normalizePocketBaseOrigin } from "./origin.js";

const environmentSchema = z.object({
  POCKETBASE_URL: z.string().min(1),
  POCKETBASE_SUPERUSER_EMAIL: z.string().min(1),
  POCKETBASE_SUPERUSER_PASSWORD: z.string().min(1),
});

export function readPocketBaseEnvironment(
  environment: Record<string, string | undefined>,
): PocketBaseCredentials {
  let mergedEnvironment = environment;
  if (environment.secrets) {
    let secrets: unknown;
    try {
      secrets = JSON.parse(environment.secrets);
    } catch {
      throw new TypeError("Amplify secrets must be a valid JSON object.");
    }

    if (
      typeof secrets !== "object" ||
      secrets === null ||
      Array.isArray(secrets)
    ) {
      throw new TypeError("Amplify secrets must be a valid JSON object.");
    }

    mergedEnvironment = {
      ...(secrets as Record<string, string | undefined>),
      ...environment,
    };
  }

  const parsed = environmentSchema.safeParse(mergedEnvironment);
  if (!parsed.success) {
    const variable = parsed.error.issues[0]?.path[0];
    const name = typeof variable === "string" ? variable : "PocketBase value";
    throw new TypeError(`Missing required environment variable ${name}.`);
  }

  let url: string;
  try {
    url = normalizePocketBaseOrigin(parsed.data.POCKETBASE_URL);
  } catch {
    throw new TypeError("POCKETBASE_URL must be a plain HTTP(S) origin.");
  }
  return {
    url,
    superuserEmail: parsed.data.POCKETBASE_SUPERUSER_EMAIL,
    superuserPassword: parsed.data.POCKETBASE_SUPERUSER_PASSWORD,
  };
}
