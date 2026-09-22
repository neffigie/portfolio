import { expect, test } from "@playwright/test";

test("short utility pages anchor the footer within one desktop viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const route of ["/", "/resume/", "/404.html"]) {
    await page.goto(route);
    const geometry = await page.evaluate(() => ({
      pageHeight: document.documentElement.scrollHeight,
      footerBottom: document
        .querySelector("body > footer")
        ?.getBoundingClientRect().bottom,
    }));
    expect(geometry.pageHeight, route).toBeLessThanOrEqual(901);
    expect(geometry.footerBottom, route).toBeGreaterThanOrEqual(899);
  }
});

test("the 404 message is centered in the available main area", async ({
  page,
}) => {
  await page.goto("/404.html");
  const positions = await page.evaluate(() => {
    const main = document.querySelector("main")?.getBoundingClientRect();
    const content = document
      .querySelector("[data-not-found-content]")
      ?.getBoundingClientRect();
    return main && content
      ? {
          mainCenter: main.top + main.height / 2,
          contentCenter: content.top + content.height / 2,
        }
      : null;
  });
  expect(positions).not.toBeNull();
  expect(
    Math.abs((positions?.mainCenter ?? 0) - (positions?.contentCenter ?? 0)),
  ).toBeLessThan(2);
});

for (const viewport of [
  { width: 360, height: 800 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
]) {
  test(`${viewport.width}px viewport keeps index and dialog usable`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/index/");
    await expect(
      page.locator("[data-index-root] [data-search-status]"),
    ).toHaveText("2 results");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.locator("[data-index-root] [data-search-result]"),
    ).toHaveCount(2);

    await page.getByRole("button", { name: "Search" }).click();
    const dialog = page.getByRole("dialog", { name: "Search everywhere" });
    await expect(dialog).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const before = await dialog.boundingBox();
    expect(before?.width).toBeLessThan(viewport.width);
    expect(before?.height).toBeLessThan(viewport.height / 2);
    await dialog.getByRole("searchbox", { name: "Search" }).fill("systems");
    await expect(dialog.locator("[data-search-result]")).toHaveCount(2);
    await expect(dialog.locator(".search-result-meta").first()).toBeHidden();
    const after = await dialog.boundingBox();
    expect(Math.abs((before?.y ?? 0) - (after?.y ?? 0))).toBeLessThan(2);
    expect(after?.height).toBeLessThan(viewport.height * 0.6);
  });
}

test("the mobile index tag picker remains operable beside the quick dialog", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/index/");
  const index = page.locator("[data-index-root]");
  await index.locator("[data-tag-picker] summary").click();
  await index.getByRole("checkbox", { name: "AWS" }).check();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(page).toHaveURL(/\/index\/\?tag=AWS$/u);
});
