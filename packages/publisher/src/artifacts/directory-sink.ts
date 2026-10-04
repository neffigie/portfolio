import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

import type { ArtifactSink } from "../media/types.js";

export class DirectoryArtifactSink implements ArtifactSink {
  readonly writes: string[] = [];
  #writeCounter = 0;

  constructor(readonly root: string) {}

  async writeAtomic(path: string, bytes: Uint8Array): Promise<void> {
    if (isAbsolute(path)) {
      throw new TypeError("Artifact paths must be relative.");
    }
    const destination = resolve(this.root, path);
    const fromRoot = relative(this.root, destination);
    if (fromRoot === ".." || fromRoot.startsWith(`..${sep}`)) {
      throw new TypeError("Artifact paths cannot escape the output directory.");
    }

    await mkdir(dirname(destination), { recursive: true });
    const partial = `${destination}.partial-${process.pid}-${this.#writeCounter}`;
    this.#writeCounter += 1;
    await writeFile(partial, bytes);
    await rename(partial, destination);
    this.writes.push(path);
  }
}
