import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, rename, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";

function hasCode(error: unknown, code: string): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === code
  );
}

export class StagedPublicationDirectory {
  readonly outputDirectory: string;
  #stagingDirectory: string | null;

  private constructor(outputDirectory: string, stagingDirectory: string) {
    this.outputDirectory = outputDirectory;
    this.#stagingDirectory = stagingDirectory;
  }

  static async create(output: string): Promise<StagedPublicationDirectory> {
    const outputDirectory = resolve(output);
    await mkdir(dirname(outputDirectory), { recursive: true });
    const stagingDirectory = await mkdtemp(`${outputDirectory}.partial-`);
    return new StagedPublicationDirectory(outputDirectory, stagingDirectory);
  }

  get path(): string {
    if (this.#stagingDirectory === null) {
      throw new TypeError("The staged publication directory is closed.");
    }
    return this.#stagingDirectory;
  }

  async commit(): Promise<void> {
    const stagingDirectory = this.path;
    const backupDirectory = `${this.outputDirectory}.previous-${randomUUID()}`;
    let hasBackup = false;

    try {
      await rename(this.outputDirectory, backupDirectory);
      hasBackup = true;
    } catch (error) {
      if (!hasCode(error, "ENOENT")) throw error;
    }

    try {
      await rename(stagingDirectory, this.outputDirectory);
      this.#stagingDirectory = null;
    } catch (error) {
      if (hasBackup) {
        try {
          await rename(backupDirectory, this.outputDirectory);
        } catch (restoreError) {
          throw new AggregateError(
            [error, restoreError],
            "Could not publish the new directory or restore the previous directory.",
          );
        }
      }
      throw error;
    }

    if (hasBackup) {
      await rm(backupDirectory, { recursive: true, force: true });
    }
  }

  async discard(): Promise<void> {
    if (this.#stagingDirectory === null) return;
    await rm(this.#stagingDirectory, { recursive: true, force: true });
    this.#stagingDirectory = null;
  }
}
