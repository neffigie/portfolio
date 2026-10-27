import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", title: "Anna Noelle", canonical: "https://www.neffigie.com/" },
  {
    path: "/index/",
    title: "Index · Anna Noelle",
    canonical: "https://www.neffigie.com/index/",
  },
  {
    path: "/resume/",
    title: "Résumé · Anna Noelle",
    canonical: "https://www.neffigie.com/resume/",
  },
  {
    path: "/project-one/",
    title: "Publication Compiler · Anna Noelle",
    canonical: "https://www.neffigie.com/project-one/",
  },
  {
    path: "/writing-one/",
    title: "Search as Navigation · Anna Noelle",
    canonical: "https://www.neffigie.com/writing-one/",
  },
];

for (const route of routes) {
  test(`${route.path} has stable public landmarks and metadata`, async ({
    page,
  }) => {
    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute(
      "href",
      route.canonical,
    );
    await expect(page.locator("meta[name='description']")).toHaveAttribute(
      "content",
      /\S/u,
    );
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(
      1,
    );
    await expect(page.locator("body > footer")).toHaveCount(1);
  });
}

test("the hand-drawn mark leads the page without creating horizontal overflow", async ({
  page,
  request,
}) => {
  await page.goto("/");

  const marks = page.locator(".brand-mark img");
  await expect(marks).toHaveCount(2);
  for (const mark of [".site-mark img", ".home-mark img"]) {
    const src = await page.locator(mark).getAttribute("src");
    expect(src, mark).toMatch(/^\/brand\/.+\.webp$/u);
    const image = await request.get(src ?? "");
    expect(image.status(), mark).toBe(200);
    expect((await image.body()).byteLength, mark).toBeLessThan(32 * 1024);
  }
  for (const mark of await marks.all()) await expect(mark).toBeVisible();
  await expect(page.locator(".site-mark img")).toHaveAttribute("alt", "");
  await expect(page.locator(".home-mark img")).toHaveAttribute(
    "alt",
    "Anna Noelle",
  );
  await expect(page.locator("#home-title .home-name")).toHaveCount(0);
  await expect(
    page.locator(".home-introduction .prose p").first().locator("strong"),
  ).toHaveText("Anna Noelle");

  const homeMarkBox = await page
    .locator("#home-title .brand-mark")
    .boundingBox();
  if (!homeMarkBox) {
    throw new Error("The homepage mark must have a layout box");
  }
  expect(homeMarkBox.height).toBeGreaterThan(68);

  const bannerMarkBox = await page
    .locator(".site-identity .brand-mark")
    .boundingBox();
  const bannerNameBox = await page
    .locator(".site-identity .site-name")
    .boundingBox();
  if (!bannerMarkBox || !bannerNameBox) {
    throw new Error("The banner mark and name must both have layout boxes");
  }
  expect(bannerMarkBox.height).toBeGreaterThan(16);
  expect(bannerMarkBox.height).toBeLessThanOrEqual(bannerNameBox.height);

  const favicon16 = page.locator("link[rel='icon'][sizes='16x16']");
  const favicon32 = page.locator("link[rel='icon'][sizes='32x32']");
  await expect(favicon16).toHaveAttribute(
    "href",
    "/images/anna-noelle-favicon-16-v2.png",
  );
  await expect(favicon32).toHaveAttribute(
    "href",
    "/images/anna-noelle-favicon-32-v2.png",
  );
  for (const size of [16, 32]) {
    const path = `/images/anna-noelle-favicon-${size}-v2.png`;
    expect((await request.get(path)).status()).toBe(200);

    const metrics = await page.evaluate(
      async ({ path, size }) => {
        const image = new Image();
        image.src = path;
        await image.decode();

        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas context unavailable");
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, size, size).data;
        let minX = size;
        let minY = size;
        let maxX = -1;
        let maxY = -1;
        for (let y = 0; y < size; y += 1) {
          for (let x = 0; x < size; x += 1) {
            if (pixels[(y * size + x) * 4 + 3] === 0) continue;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
        return {
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          margins: [minX, size - 1 - maxX, minY, size - 1 - maxY],
        };
      },
      { path, size },
    );

    expect(metrics.naturalWidth).toBe(size);
    expect(metrics.naturalHeight).toBe(size);
    expect(Math.min(...metrics.margins)).toBeGreaterThanOrEqual(1);
  }

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
});

test("the public sitemap and feed exclude drafts and retired routes", async ({
  request,
}) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const feed = await (await request.get("/index.xml")).text();

  for (const path of ["/project-one/", "/writing-one/"]) {
    expect(sitemap).toContain(path);
    expect(feed).toContain(path);
  }
  for (const path of ["/draft-notes/", "/blog/", "/projects/", "/home/"]) {
    expect(sitemap).not.toContain(path);
    expect(feed).not.toContain(path);
  }
  expect(sitemap).toContain("/index/");
  expect(feed).not.toContain("/index/");
});

test("authored posts keep their rhythm inside a phone viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/writing-one/");

  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);

  const list = page.locator(".prose > ul");
  const listBox = await list.boundingBox();
  const itemBox = await list.locator("> li").first().boundingBox();
  const nestedBox = await list.locator("ul > li").first().boundingBox();
  if (!listBox || !itemBox || !nestedBox) {
    throw new Error("The authored lists must have layout boxes");
  }
  expect(itemBox.x - listBox.x, "room for bullet markers").toBeGreaterThan(16);
  expect(nestedBox.x, "nested lists indent").toBeGreaterThan(itemBox.x);

  const gaps = await page.locator(".prose").evaluate((prose) => {
    const children = [...prose.children];
    const gapBefore = (tag: string) => {
      const index = children.findIndex(
        (child, position) => position > 0 && child.tagName === tag,
      );
      const previous = children[index - 1]?.getBoundingClientRect();
      const current = children[index]?.getBoundingClientRect();
      return previous && current ? current.top - previous.bottom : -1;
    };
    return { heading: gapBefore("H2"), paragraph: gapBefore("P") };
  });
  expect(gaps.heading).toBeGreaterThan(gaps.paragraph);
});

test("internal links in the built site resolve", async ({ page, request }) => {
  const hrefs = new Set<string>();
  for (const route of routes) {
    await page.goto(route.path);
    for (const href of await page
      .locator("a[href^='/']")
      .evaluateAll((anchors) =>
        anchors.map((anchor) => anchor.getAttribute("href") ?? ""),
      )) {
      if (href) hrefs.add(href);
    }
  }

  for (const href of hrefs) {
    const response = await request.get(href);
    expect(response.status(), `Broken internal link: ${href}`).toBeLessThan(
      400,
    );
  }
});

test("unknown and removed routes show the navigable 404 page", async ({
  page,
}) => {
  for (const route of ["/not-a-real-entry/", "/about/"]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Primary" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Return home" }),
    ).toHaveAttribute("href", "/");
  }
});
