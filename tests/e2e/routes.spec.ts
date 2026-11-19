import { expect, test } from "@playwright/test";

const routes = [
  {
    path: "/",
    title: "Anna Noelle",
    canonical: "https://www.neffigie.com/",
    activeNav: "home",
  },
  {
    path: "/posts/",
    title: "posts · Anna Noelle",
    canonical: "https://www.neffigie.com/posts/",
    activeNav: "posts",
  },
  {
    path: "/resume/",
    title: "Résumé · Anna Noelle",
    canonical: "https://www.neffigie.com/resume/",
    activeNav: "resume",
  },
  {
    path: "/p/project-one/",
    title: "Publication Compiler · Anna Noelle",
    canonical: "https://www.neffigie.com/p/project-one/",
    activeNav: "posts",
  },
  {
    path: "/p/writing-one/",
    title: "Search as Navigation · Anna Noelle",
    canonical: "https://www.neffigie.com/p/writing-one/",
    activeNav: "posts",
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
    await expect(
      page.locator('.primary-navigation a[aria-current="page"]'),
    ).toHaveText(route.activeNav);
    await expect(page.locator("body > footer")).toHaveCount(0);
  });
}

test("text links animate a rainbow underline while active navigation stays black", async ({
  page,
}) => {
  await page.goto("/");
  const inactive = page.getByRole("link", { name: "resume", exact: true });
  const active = page.locator('.primary-navigation a[aria-current="page"]');

  const inactiveBefore = await inactive.evaluate((link) => {
    const style = getComputedStyle(link);
    return {
      backgroundImage: style.backgroundImage,
      backgroundSize: style.backgroundSize,
      transitionDuration: style.transitionDuration,
      transitionTimingFunction: style.transitionTimingFunction,
    };
  });
  expect(inactiveBefore.backgroundImage).toContain("linear-gradient");
  expect(inactiveBefore.backgroundSize).toBe("0% 1px");
  expect(inactiveBefore.transitionDuration).toContain("0.15s");
  expect(inactiveBefore.transitionTimingFunction).toContain("ease-out");

  await inactive.hover();
  await expect(inactive).toHaveCSS("background-size", "100% 1px");
  await expect(active).toHaveCSS("background-size", "100% 1px");
  const activeGradient = await active.evaluate(
    (link) => getComputedStyle(link).backgroundImage,
  );
  expect(activeGradient.match(/rgb\(/gu)?.length).toBe(2);
});

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
  await expect(page.locator(".home-introduction .prose")).toHaveCount(0);
  await expect(page.locator(".home-social-link")).toHaveText([
    "anna@neffigie.com",
    "linkedin",
    "github",
    "tiktok",
    "instagram",
    "youtube",
    "x/twitter",
  ]);
  await expect(page.getByRole("link", { name: "itch.io" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "twitch" })).toHaveCount(0);

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
  if (!bannerMarkBox) {
    throw new Error("The banner mark must have a layout box");
  }
  expect(bannerMarkBox.height).toBeGreaterThanOrEqual(12);
  expect(bannerMarkBox.height).toBeGreaterThanOrEqual(17);
  expect(bannerMarkBox.height).toBeLessThanOrEqual(21);

  for (const control of [
    page.locator(".primary-navigation a").first(),
    page.locator(".search-launcher"),
  ]) {
    expect(
      Number.parseFloat(
        await control.evaluate((node) => getComputedStyle(node).fontSize),
      ),
    ).toBeGreaterThanOrEqual(16);
  }
  await expect(page.locator(".search-launcher svg")).toHaveCount(1);
  await expect(page.locator(".search-launcher")).toHaveText("");

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

test("the resume download uses the quieter external-link treatment", async ({
  page,
}) => {
  await page.goto("/resume/");
  const link = page.locator(".resume-download");
  await expect(link.locator(".external-link-icon")).toHaveCount(1);
  expect(await link.evaluate((node) => getComputedStyle(node).color)).toBe(
    "rgb(95, 99, 104)",
  );
  expect(
    await link.evaluate((node) => getComputedStyle(node).backgroundSize),
  ).toBe("0% 1px, 100% 1px");
  await link.hover();
  await expect
    .poll(() => link.evaluate((node) => getComputedStyle(node).backgroundSize))
    .toBe("100% 1px, 100% 1px");
  const iconBox = await link.locator(".external-link-icon").boundingBox();
  const fontSize = Number.parseFloat(
    await link.evaluate((node) => getComputedStyle(node).fontSize),
  );
  expect(iconBox?.width ?? 0).toBeGreaterThanOrEqual(fontSize * 0.95);
});

test("bare authored URLs become external links", async ({ page }) => {
  const href =
    "https://doi.org/10.5824/example.2022.01.003.an-unbroken-citation-that-is-wider-than-a-phone";
  await page.goto("/p/writing-one/");
  const link = page.locator(`.prose a[href="${href}"]`);
  await expect(link).toHaveAttribute("data-link-kind", "external");
  await expect(link.locator(".external-link-icon")).toHaveCount(1);
});

test("the public sitemap and feed exclude drafts and retired routes", async ({
  request,
}) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const feed = await (await request.get("/index.xml")).text();

  for (const path of ["/p/project-one/", "/p/writing-one/"]) {
    expect(sitemap).toContain(path);
    expect(feed).toContain(path);
  }
  for (const path of ["/draft-notes/", "/blog/", "/projects/", "/home/"]) {
    expect(sitemap).not.toContain(path);
    expect(feed).not.toContain(path);
  }
  expect(sitemap).toContain("/posts/");
  expect(feed).not.toContain("/posts/");
  expect(sitemap).not.toContain("/index/");
});

test("authored posts keep their rhythm inside a phone viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/p/writing-one/");

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
    await expect(page.getByRole("heading", { name: "error" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Primary" }),
    ).toBeVisible();
    await expect(
      page.locator('.primary-navigation a[aria-current="page"]'),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "return home" }),
    ).toHaveAttribute("href", "/");
    await expect(page.locator(".not-found-content > p").first()).toHaveText(
      "page not found",
    );
  }
});
