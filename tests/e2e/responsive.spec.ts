import { expect, test } from "@playwright/test";

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
    if (viewport.width === 360) {
      const bounds = await dialog.boundingBox();
      expect(bounds?.width).toBeGreaterThanOrEqual(359);
      expect(bounds?.height).toBeGreaterThanOrEqual(799);
    }
    await expect(
      dialog.getByRole("link", { name: "View in Index" }),
    ).toBeVisible();
  });
}
