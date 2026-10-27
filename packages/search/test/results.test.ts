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

  it("formats dates exactly like the server-rendered rows", () => {
    const time = renderResultRow(result).querySelector("time");
    expect(time?.getAttribute("datetime")).toBe("2026-09-20");
    expect(time?.textContent).toBe("Sep 20, 2026");
  });

  it("keeps an unparseable date as authored text", () => {
    const time = renderResultRow({ ...result, date: "someday" }).querySelector(
      "time",
    );
    expect(time?.textContent).toBe("someday");
  });
});
