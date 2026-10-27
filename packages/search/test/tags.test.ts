// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";

import { TagPicker } from "../src/tags.js";

function picker(): TagPicker {
  document.body.innerHTML = `
    <div data-tag-picker>
      <div data-tag-pills></div>
      <input data-tag-filter>
      <label><input type="checkbox" value="App" data-tag-option> App</label>
      <label><input type="checkbox" value="TypeScript" data-tag-option> TypeScript</label>
      <p data-tag-empty hidden></p>
    </div>`;
  return new TagPicker(
    document.querySelector<HTMLElement>("[data-tag-picker]") as HTMLElement,
  );
}

describe("TagPicker", () => {
  it("canonicalizes shared-URL tags to the published label casing", () => {
    const tags = picker();
    tags.render(["app", "TYPESCRIPT", "Unknown"]);
    expect(tags.values()).toEqual(["App", "TypeScript", "Unknown"]);
  });
});
