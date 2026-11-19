import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const route of ["/", "/posts/", "/resume/", "/p/project-one/"]) {
  test(`${route} has no serious or critical axe violations`, async ({
    page,
  }) => {
    await page.goto(route);
    if (route === "/posts/") {
      await expect(
        page.locator("[data-index-root] [data-search-status]"),
      ).toHaveText("2 results");
    }
    const scan = await new AxeBuilder({ page }).analyze();
    expect(
      scan.violations.filter((violation) =>
        ["serious", "critical"].includes(violation.impact ?? ""),
      ),
    ).toEqual([]);
    await expect(page.locator("img:not([alt])")).toHaveCount(0);
  });
}

test("dialog retains keyboard focus and restores it on Escape", async ({
  page,
}) => {
  await page.goto("/");
  const launcher = page.getByRole("button", { name: "search", exact: true });
  await launcher.focus();
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "search everywhere" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("searchbox", { name: "search" })).toBeFocused();
  await expect(dialog.locator("[data-pinned-entry]")).toHaveCount(0);

  await dialog.getByRole("searchbox", { name: "search" }).fill("compiler");
  await expect(dialog.locator("[data-search-status]")).toHaveText("1 result");
  await page.keyboard.press("ArrowDown");
  await expect(
    dialog.getByRole("link", { name: "Publication Compiler" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(launcher).toBeFocused();
});

test("dialog and page landmarks pass serious/critical axe checks", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "search", exact: true }).click();
  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    ),
  ).toEqual([]);
});

test("posts filters and selected tag pills pass axe checks", async ({
  page,
}) => {
  await page.goto("/posts/");
  const index = page.locator("[data-index-root]");
  await index.locator(".posts-filter-disclosure > summary").click();
  await index.locator("[data-tag-picker] summary").click();
  await index.getByRole("checkbox", { name: "aws" }).check();
  await expect(
    index.getByRole("button", { name: "remove aws tag" }),
  ).toBeVisible();

  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    ),
  ).toEqual([]);
});
