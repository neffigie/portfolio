import { buildSite } from "./build-site.js";

export default async function setup(): Promise<void> {
  await buildSite();
}
