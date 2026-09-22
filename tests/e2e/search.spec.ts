import { expect, test } from "@playwright/test";

const indexResults = (page: import("@playwright/test").Page) =>
  page.locator("[data-index-root] [data-search-results] > li a");

test("Search Everywhere starts empty and shows only query results", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Search everywhere" });
  const query = dialog.getByRole("searchbox", { name: "Search" });
  await expect(query).toBeFocused();
  await expect(dialog.locator("[data-pinned-entry]")).toHaveCount(0);
  await expect(dialog.locator("[data-search-result]")).toHaveCount(0);
  await expect(dialog.locator("[data-search-type]")).toHaveCount(0);
  await expect(dialog.locator("[data-tag-picker]")).toHaveCount(0);
  await expect(dialog.locator("[data-search-sort]")).toHaveCount(0);
  await expect(dialog.locator("[data-search-status]")).toBeEmpty();

  await query.fill("canonical");
  await expect(dialog.locator("[data-search-status]")).toHaveText("1 result");
  await expect(dialog.locator("[data-search-result]")).toHaveCount(1);
  await expect(dialog.locator("[data-result-preview]")).toContainText(
    "Canonical snapshots keep deployments reproducible",
  );
  await query.fill("");
  await expect(dialog.locator("[data-search-status]")).toBeEmpty();
  await expect(dialog.locator("[data-search-result]")).toHaveCount(0);
});

test("the unfiltered index browses newest first and searches title and body", async ({
  page,
}) => {
  await page.goto("/index/");
  await expect(
    page.locator("[data-index-root] [data-search-status]"),
  ).toHaveText("2 results");
  await expect(indexResults(page)).toHaveText([
    "Publication Compiler",
    "Search as Navigation",
  ]);

  const query = page.locator("[data-index-root] [data-search-query]");
  await query.fill("navigation");
  await expect(indexResults(page)).toHaveText(["Search as Navigation"]);
  await expect(page).toHaveURL(/\/index\/\?q=navigation$/u);

  await query.fill("canonical");
  await expect(indexResults(page)).toHaveText(["Publication Compiler"]);
});

test("type, tag intersection, and sort operate on the same corpus", async ({
  page,
}) => {
  await page.goto("/index/");
  await expect(
    page.locator("[data-index-root] [data-search-status]"),
  ).toHaveText("2 results");
  await page
    .locator("[data-index-root] [data-search-type]")
    .selectOption("writing");
  await expect(indexResults(page)).toHaveText(["Search as Navigation"]);

  await page.locator("[data-index-root] [data-search-type]").selectOption("");
  const index = page.locator("[data-index-root]");
  await index.locator("[data-tag-picker] summary").click();
  await index.getByRole("checkbox", { name: "AWS" }).check();
  await index.getByRole("checkbox", { name: "Systems" }).check();
  await expect(indexResults(page)).toHaveText(["Publication Compiler"]);
  await index.getByRole("checkbox", { name: "Systems" }).uncheck();
  await index.getByRole("checkbox", { name: "Search" }).check();
  await expect(indexResults(page)).toHaveCount(0);
  await expect(
    page.locator("[data-index-root] [data-search-status]"),
  ).toHaveText("No results");

  await index.getByRole("button", { name: "Remove AWS tag" }).click();
  await index.getByRole("button", { name: "Remove Search tag" }).click();
  await page
    .locator("[data-index-root] [data-search-sort]")
    .selectOption("oldest");
  await expect(indexResults(page)).toHaveText([
    "Search as Navigation",
    "Publication Compiler",
  ]);
  await page
    .locator("[data-index-root] [data-search-sort]")
    .selectOption("title");
  await expect(indexResults(page)).toHaveText([
    "Publication Compiler",
    "Search as Navigation",
  ]);
});

test("overlay and index use the same query and supporting passage", async ({
  page,
}) => {
  await page.goto("/project-one/");
  await page.getByRole("button", { name: "Search" }).click();
  const dialog = page.getByRole("dialog", { name: "Search everywhere" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("searchbox", { name: "Search" }).fill("canonical");
  await expect(dialog.locator("[data-search-status]")).toHaveText("1 result");
  const overlayHref = await dialog
    .locator("[data-search-results] > li a")
    .getAttribute("href");
  const overlayPassage = await dialog
    .locator("[data-result-preview]")
    .textContent();

  await page.goto("/index/?q=canonical");
  await expect(
    page.locator("[data-index-root] [data-search-status]"),
  ).toHaveText("1 result");
  expect(await indexResults(page).first().getAttribute("href")).toBe(
    overlayHref,
  );
  expect(
    await page.locator("[data-index-root] [data-result-preview]").textContent(),
  ).toBe(overlayPassage);

  await page.reload();
  await expect(indexResults(page)).toHaveText(["Publication Compiler"]);
});

test("index reconstructs state after browser history navigation", async ({
  page,
}) => {
  await page.goto("/index/?q=compiler");
  await expect(indexResults(page)).toHaveText(["Publication Compiler"]);
  await page.evaluate(() => {
    history.pushState({}, "", "/index/?type=writing&tag=Search");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect(
    page.locator("[data-index-root] [data-search-type]"),
  ).toHaveValue("writing");
  await expect(
    page.locator('[data-index-root] [data-remove-tag="Search"]'),
  ).toHaveCount(1);
  await expect(indexResults(page)).toHaveText(["Search as Navigation"]);
});
