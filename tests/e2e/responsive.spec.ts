import { expect, test } from "@playwright/test";

test("entry body is separated from its metadata", async ({ page }) => {
  await page.goto("/index/");
  const entryPath = await page
    .locator(".search-result-link")
    .first()
    .getAttribute("href");
  if (entryPath === null) {
    throw new Error("The index has no published entry to open");
  }
  await page.goto(entryPath);
  const marginTop = await page
    .locator(".entry-header + .prose")
    .evaluate((body) => Number.parseFloat(getComputedStyle(body).marginTop));

  expect(marginTop).toBeGreaterThan(0);
});

test("content pages share the same left alignment across routes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const contentRegions = [
    ["/", ".home-introduction"],
    ["/resume/", ".reserved-page"],
    ["/index/", ".site-main"],
    ["/project-one/", ".entry"],
  ] as const;
  const leftEdges: number[] = [];

  for (const [route, selector] of contentRegions) {
    await page.goto(route);
    leftEdges.push(
      await page
        .locator(selector)
        .evaluate((element) => element.getBoundingClientRect().left),
    );
  }

  expect(Math.max(...leftEdges) - Math.min(...leftEdges)).toBeLessThan(2);
});

test("page frame reserves space for the vertical scrollbar", async ({
  page,
}) => {
  await page.goto("/");
  const scrollbarGutter = await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollbarGutter,
  );

  expect(scrollbarGutter).toBe("stable");
});

test("résumé content is vertically centered like the home page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/resume/");
  const centers = await page.evaluate(() => {
    const main = document.querySelector("main")?.getBoundingClientRect();
    const content = document
      .querySelector(".reserved-page")
      ?.getBoundingClientRect();
    return main && content
      ? {
          main: main.top + main.height / 2,
          content: content.top + content.height / 2,
        }
      : null;
  });

  expect(centers).not.toBeNull();
  expect(Math.abs((centers?.main ?? 0) - (centers?.content ?? 0))).toBeLessThan(
    2,
  );
});

test("short utility pages anchor the footer within one desktop viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1536, height: 851 });
  for (const route of ["/", "/resume/", "/404.html"]) {
    await page.goto(route);
    const geometry = await page.evaluate(() => ({
      pageHeight: document.documentElement.scrollHeight,
      footerBottom: document
        .querySelector("body > footer")
        ?.getBoundingClientRect().bottom,
    }));
    expect(geometry.pageHeight, route).toBeLessThanOrEqual(852);
    expect(geometry.footerBottom, route).toBeGreaterThanOrEqual(850);
  }
});

test("footer social links form a compact icon group", async ({ page }) => {
  await page.setViewportSize({ width: 1536, height: 851 });
  await page.goto("/");
  const links = page.locator(".social-link");
  const boxes = await Promise.all(
    [0, 1, 2].map((index) => links.nth(index).boundingBox()),
  );

  expect(boxes).toHaveLength(3);
  for (const box of boxes) {
    expect(box?.width).toBeLessThanOrEqual(33);
    expect(box?.height).toBeLessThanOrEqual(33);
  }
  for (let index = 1; index < boxes.length; index += 1) {
    const previous = boxes[index - 1];
    const current = boxes[index];
    expect(
      (current?.x ?? 0) - ((previous?.x ?? 0) + (previous?.width ?? 0)),
    ).toBeLessThanOrEqual(5);
  }
  const fills = await links
    .locator("svg")
    .evaluateAll((icons) => icons.map((icon) => getComputedStyle(icon).fill));
  expect(fills[0]).toBe("none");
  expect(fills[1]).not.toBe("none");
  expect(fills[2]).not.toBe("none");
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

for (const width of [360, 1440]) {
  test(`the ${width}px tag menu floats without stretching index filters`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/index/");
    const index = page.locator("[data-index-root]");
    const query = index.locator("[data-search-query]");
    const type = index.locator("[data-search-type]");
    const field = index.locator("[data-tag-field]");
    const sort = index.locator("[data-search-sort]");
    const summary = index.locator("[data-tag-picker] summary");
    const menu = index.locator(".tag-picker-menu");
    const status = index.locator("[data-search-status]");
    const controls = await Promise.all(
      [query, type, field, sort].map((control) => control.boundingBox()),
    );
    const heights = controls.map((box) => box?.height ?? 0);
    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThan(2);
    for (const row of width === 360
      ? [
          [0, 1],
          [2, 3],
        ]
      : [[0, 1, 2, 3]]) {
      const tops = row.map((column) => controls[column]?.y ?? 0);
      expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(2);
    }
    const queryBefore = controls[0];
    const fieldBefore = await field.boundingBox();
    const statusBefore = await status.boundingBox();

    await summary.click();
    const queryOpen = await query.boundingBox();
    const menuOpen = await menu.boundingBox();
    const statusOpen = await status.boundingBox();
    expect(queryOpen?.height).toBeLessThan(50);
    expect(Math.abs((queryOpen?.y ?? 0) - (queryBefore?.y ?? 0))).toBeLessThan(
      2,
    );
    expect(
      Math.abs((statusOpen?.y ?? 0) - (statusBefore?.y ?? 0)),
    ).toBeLessThan(2);
    expect(menuOpen?.y).toBeGreaterThanOrEqual(
      (fieldBefore?.y ?? 0) + (fieldBefore?.height ?? 0) - 1,
    );

    await index.getByRole("checkbox", { name: "AWS" }).check();
    const fieldSelected = await field.boundingBox();
    const pill = await index
      .getByRole("button", { name: "Remove AWS tag" })
      .boundingBox();
    const menuSelected = await menu.boundingBox();
    expect(fieldSelected?.height).toBeLessThanOrEqual(
      (fieldBefore?.height ?? 0) + 1,
    );
    expect(pill?.y).toBeGreaterThanOrEqual(fieldSelected?.y ?? 0);
    expect((pill?.y ?? 0) + (pill?.height ?? 0)).toBeLessThanOrEqual(
      (fieldSelected?.y ?? 0) + (fieldSelected?.height ?? 0),
    );
    expect(menuSelected?.y).toBeGreaterThanOrEqual(
      (fieldSelected?.y ?? 0) + (fieldSelected?.height ?? 0) - 1,
    );

    for (const tag of ["Systems", "TypeScript", "Search"]) {
      await index.getByRole("checkbox", { name: tag }).check();
    }
    const fullField = await field.boundingBox();
    const fullStatus = await status.boundingBox();
    const overflow = await index
      .locator("[data-tag-pills]")
      .evaluate((pills) => ({
        clientWidth: pills.clientWidth,
        scrollLeft: pills.scrollLeft,
        scrollWidth: pills.scrollWidth,
      }));
    expect(fullField?.height).toBeLessThanOrEqual(
      (fieldBefore?.height ?? 0) + 1,
    );
    expect(
      Math.abs((fullStatus?.y ?? 0) - (statusBefore?.y ?? 0)),
    ).toBeLessThan(2);
    expect(overflow.scrollWidth).toBeGreaterThan(overflow.clientWidth);
    expect(overflow.scrollLeft).toBeGreaterThan(0);

    await index.getByRole("button", { name: "Remove AWS tag" }).click();
    await expect(page).toHaveURL(/tag=Systems/u);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
