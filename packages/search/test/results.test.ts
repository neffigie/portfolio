// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";

import type { SearchResult } from "../src/pagefind.js";
import { renderResultRow } from "../src/results.js";

const result: SearchResult = {
  url: "/project-one/",
  title: "Publication Compiler",
  supportingText: "A deterministic source snapshot.",
  type: "project",
  date: "2026-09-20",
  tags: ["AWS", "Systems"],
};

describe("result row", () => {
  it("renders a semantic link with complete compact metadata", () => {
    const row = renderResultRow(result);

    expect(row.tagName).toBe("LI");
    expect(row.querySelector("a")?.getAttribute("href")).toBe("/project-one/");
    expect(row.querySelector("a")?.textContent).toBe("Publication Compiler");
    expect(row.textContent).toContain("A deterministic source snapshot.");
    expect(row.textContent).toContain("project");
    expect(row.querySelector("time")?.getAttribute("datetime")).toBe(
      "2026-09-20",
    );
    expect(
      [...row.querySelectorAll("[data-result-tag]")].map(
        (tag) => tag.textContent,
      ),
    ).toEqual(["AWS", "Systems"]);
    expect(row.querySelector("img")).toBeNull();
  });

  it("omits an absent preview without inventing a placeholder", () => {
    const row = renderResultRow({ ...result, supportingText: "" });
    expect(row.querySelector("[data-result-preview]")).toBeNull();
  });

  it("treats authored values as text and rejects executable URLs", () => {
    const row = renderResultRow({
      ...result,
      url: "javascript:alert(1)",
      title: "<img src=x onerror=alert(1)>",
      supportingText: "<script>alert(1)</script>",
      tags: ["<script>alert(1)</script>"],
    });

    expect(row.querySelector("img, script")).toBeNull();
    expect(row.querySelector("a")?.textContent).toBe(
      "<img src=x onerror=alert(1)>",
    );
    expect(row.querySelector("a")?.getAttribute("href")).toBe("/index/");
    expect(row.querySelector("[data-result-preview]")?.textContent).toBe(
      "<script>alert(1)</script>",
    );
  });
});
