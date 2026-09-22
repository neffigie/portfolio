import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const route of ["/", "/index/", "/resume/", "/project-one/"]) {
  test(`${route} has no serious or critical axe violations`, async ({
    page,
  }) => {
    await page.goto(route);
    if (route === "/index/") {
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
  const launcher = page.getByRole("button", { name: "Search", exact: true });
  await launcher.focus();
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Search everywhere" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("searchbox", { name: "Search" })).toBeFocused();
  await expect(dialog.locator("[data-pinned-entry]")).toHaveCount(2);

  await dialog.getByRole("searchbox", { name: "Search" }).fill("compiler");
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
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    ),
  ).toEqual([]);
});

test("expanded filters and selected tag pills pass axe checks", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Search everywhere" });
  await dialog.getByText("More filters").click();
  await dialog.locator("[data-tag-picker] summary").click();
  await dialog.getByRole("checkbox", { name: "AWS" }).check();
  await expect(
    dialog.getByRole("button", { name: "Remove AWS tag" }),
  ).toBeVisible();

  const scan = await new AxeBuilder({ page }).analyze();
  expect(
    scan.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    ),
  ).toEqual([]);
});
