import { expect, test } from "@playwright/test";

const indexResults = (page: import("@playwright/test").Page) =>
  page.locator("[data-index-root] [data-search-results] > li a");

const openFilters = async (page: import("@playwright/test").Page) => {
  const disclosure = page.locator("[data-index-root] .posts-filter-disclosure");
  if ((await disclosure.getAttribute("open")) === null) {
    await disclosure.locator(":scope > summary").click();
  }
};

test("Search Everywhere starts empty and shows only query results", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "search", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "search everywhere" });
  const query = dialog.getByRole("searchbox", { name: "search" });
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
  await expect(dialog.locator("[data-search-result] .pin-icon")).toHaveCount(1);
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
  await page.goto("/posts/");
  await expect(
    page.locator("[data-index-root] [data-search-status]"),
  ).toHaveText("2 results");
  await expect(indexResults(page)).toHaveText([
    "Search as Navigation",
    "Publication Compiler",
  ]);

  const query = page.locator("[data-index-root] [data-search-query]");
  await query.fill("navigation");
  await expect(indexResults(page)).toHaveText(["Search as Navigation"]);
  await expect(page).toHaveURL(/\/posts\/\?q=navigation$/u);

  await query.fill("canonical");
  await expect(indexResults(page)).toHaveText(["Publication Compiler"]);
});

test("type, tag intersection, and sort operate on the same corpus", async ({
  page,
}) => {
  await page.goto("/posts/");
  await expect(
    page.locator("[data-index-root] [data-search-status]"),
  ).toHaveText("2 results");
  await openFilters(page);
  await page
    .locator('[data-index-root] [data-filter-select="type"] summary')
    .click();
  await page
    .locator('[data-index-root] [data-filter-select="type"]')
    .getByRole("button", { name: "writing", exact: true })
    .click();
  await expect(indexResults(page)).toHaveText(["Search as Navigation"]);

  await page
    .locator('[data-index-root] [data-filter-select="type"] summary')
    .click();
  await page
    .locator('[data-index-root] [data-filter-select="type"]')
    .getByRole("button", { name: "all types", exact: true })
    .click();
  const index = page.locator("[data-index-root]");
  await index.locator("[data-tag-picker] summary").click();
  await index.getByRole("checkbox", { name: "aws" }).check();
  await index.getByRole("checkbox", { name: "systems" }).check();
  await expect(indexResults(page)).toHaveText(["Publication Compiler"]);
  await index.getByRole("checkbox", { name: "systems" }).uncheck();
  await index.getByRole("checkbox", { name: "search" }).check();
  await expect(indexResults(page)).toHaveCount(0);
  await expect(
    page.locator("[data-index-root] [data-search-status]"),
  ).toHaveText("no results");

  await index.getByRole("button", { name: "remove aws tag" }).click();
  await index.getByRole("button", { name: "remove search tag" }).click();
  await page
    .locator('[data-index-root] [data-filter-select="sort"] summary')
    .click();
  await page
    .locator('[data-index-root] [data-filter-select="sort"]')
    .getByRole("button", { name: "oldest", exact: true })
    .click();
  await expect(indexResults(page)).toHaveText([
    "Search as Navigation",
    "Publication Compiler",
  ]);
  await page
    .locator('[data-index-root] [data-filter-select="sort"] summary')
    .click();
  await page
    .locator('[data-index-root] [data-filter-select="sort"]')
    .getByRole("button", { name: "title", exact: true })
    .click();
  await expect(indexResults(page)).toHaveText([
    "Publication Compiler",
    "Search as Navigation",
  ]);
});

test("filters expand inline, stay open, and report active criteria", async ({
  page,
}) => {
  await page.goto("/posts/");
  const index = page.locator("[data-index-root]");
  const disclosure = index.locator(".posts-filter-disclosure");
  const status = index.locator("[data-search-status]");
  const statusTopClosed = (await status.boundingBox())?.y ?? 0;

  await openFilters(page);
  await expect(disclosure).toHaveAttribute("open", "");
  await expect(disclosure.locator("[data-filter-count]")).toBeHidden();

  const panel = index.locator(".posts-filter-panel");
  const panelBox = await panel.boundingBox();
  const statusBox = await status.boundingBox();
  expect((panelBox?.y ?? 0) + (panelBox?.height ?? 0)).toBeLessThanOrEqual(
    statusBox?.y ?? 0,
  );
  expect(statusBox?.y ?? 0).toBeGreaterThan(statusTopClosed);

  await expect(panel).toHaveCSS("border-top-width", "1px");
  expect(
    Number.parseFloat(
      await panel.evaluate(
        (node) => getComputedStyle(node).borderBottomLeftRadius,
      ),
    ),
  ).toBeGreaterThan(0);
  expect(
    Number.parseFloat(
      await panel.evaluate(
        (node) => getComputedStyle(node).borderBottomRightRadius,
      ),
    ),
  ).toBeGreaterThan(0);
  const filterControls = panel.locator(".filter-value-control");
  await expect(filterControls).toHaveCount(3);
  for (const control of await filterControls.all())
    await expect(control).toBeVisible();

  await index.locator('[data-filter-select="type"] summary').click();
  await index
    .locator('[data-filter-select="type"]')
    .getByRole("button", { name: "writing", exact: true })
    .click();
  await expect(disclosure).toHaveAttribute("open", "");
  await expect(disclosure.locator("[data-filter-count]")).toHaveText("1");
  await expect(disclosure.locator(":scope > summary")).toHaveAttribute(
    "aria-label",
    "filters, 1 active",
  );

  await index.locator("[data-tag-picker] summary").click();
  await expect(
    index.getByRole("searchbox", { name: "find a tag" }),
  ).toHaveCount(0);
  await index.getByRole("checkbox", { name: "systems" }).check();
  await expect(disclosure).toHaveAttribute("open", "");
  await expect(disclosure.locator("[data-filter-count]")).toHaveText("2");

  await index.locator("[data-search-query]").fill("navigation");
  await expect(disclosure.locator("[data-filter-count]")).toHaveText("2");
});

test("server and search result pins use the compact upright mark", async ({
  page,
}) => {
  await page.goto("/posts/");
  const serverPin = page.locator("[data-index-root] .pin-icon").first();
  const serverLink = page
    .locator("[data-index-root] .search-result-link")
    .first();
  const serverTitle = serverLink.locator(".search-result-title");
  await expect(serverTitle).toHaveCount(1);
  const serverPinBox = await serverPin.boundingBox();
  const serverTitleBox = await serverTitle.boundingBox();
  expect(
    Math.abs(
      (serverPinBox?.y ?? 0) +
        (serverPinBox?.height ?? 0) / 2 -
        ((serverTitleBox?.y ?? 0) + (serverTitleBox?.height ?? 0) / 2),
    ),
  ).toBeLessThan(2);

  await page.getByRole("button", { name: "search", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "search everywhere" });
  await dialog.getByRole("searchbox", { name: "search" }).fill("canonical");
  await expect(dialog.locator(".pin-icon")).toHaveCount(1);
});

test("overlay and index use the same query and supporting passage", async ({
  page,
}) => {
  await page.goto("/p/project-one/");
  await page.getByRole("button", { name: "search" }).click();
  const dialog = page.getByRole("dialog", { name: "search everywhere" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("searchbox", { name: "search" }).fill("canonical");
  await expect(dialog.locator("[data-search-status]")).toHaveText("1 result");
  const overlayHref = await dialog
    .locator("[data-search-results] > li a")
    .getAttribute("href");
  const overlayPassage = await dialog
    .locator("[data-result-preview]")
    .textContent();

  await page.goto("/posts/?q=canonical");
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

test("posts reconstructs state after browser history navigation", async ({
  page,
}) => {
  await page.goto("/posts/?q=compiler");
  await expect(indexResults(page)).toHaveText(["Publication Compiler"]);
  await page.evaluate(() => {
    history.pushState({}, "", "/posts/?type=writing&tag=Search");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await openFilters(page);
  await expect(
    page.locator("[data-index-root] [data-search-type]"),
  ).toHaveValue("writing");
  await expect(
    page.locator('[data-index-root] [data-remove-tag="search"]'),
  ).toHaveCount(1);
  await expect(indexResults(page)).toHaveText(["Search as Navigation"]);
});

test("the unfiltered posts list is served complete without loading search", async ({
  page,
}) => {
  const searchRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/pagefind/"))
      searchRequests.push(request.url());
  });
  await page.goto("/posts/");
  await expect(
    page.locator("[data-index-root] [data-search-status]"),
  ).toHaveText("2 results");
  await expect(indexResults(page)).toHaveText([
    "Search as Navigation",
    "Publication Compiler",
  ]);
  await expect(page.locator("[data-index-root] time").first()).toHaveText(
    "aug 20, 2026",
  );
  await page.waitForLoadState("networkidle");
  expect(searchRequests).toEqual([]);
});

test("shared tag links match regardless of letter case", async ({ page }) => {
  await page.goto("/posts/?tag=systems");
  await expect(
    page.locator('[data-index-root] [data-remove-tag="systems"]'),
  ).toHaveCount(1);
  await expect(
    page.locator("[data-index-root] [data-search-status]"),
  ).toHaveText("2 results");
  await expect(page.locator("[data-index-root] time").first()).toHaveText(
    "aug 20, 2026",
  );
});
