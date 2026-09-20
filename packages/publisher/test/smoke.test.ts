import { describe, expect, it } from "vitest";

import { CONTRACT_VERSION } from "../src/index.js";

describe("publisher package", () => {
  it("exposes the initial contract version", () => {
    expect(CONTRACT_VERSION).toBe(1);
  });
});
