import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", title: "Anna Noelle", canonical: "https://neffigie.dev/" },
  {
    path: "/index/",
    title: "Index · Anna Noelle",
    canonical: "https://neffigie.dev/index/",
  },
  {
    path: "/about/",
    title: "About Anna Noelle · Anna Noelle",
    canonical: "https://neffigie.dev/about/",
  },
  {
    path: "/resume/",
    title: "Résumé · Anna Noelle",
    canonical: "https://neffigie.dev/resume/",
  },
  {
    path: "/project-one/",
    title: "Publication Compiler · Anna Noelle",
    canonical: "https://neffigie.dev/project-one/",
  },
  {
    path: "/writing-one/",
    title: "Search as Navigation · Anna Noelle",
    canonical: "https://neffigie.dev/writing-one/",
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
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(
      1,
    );
    await expect(page.locator("body > footer")).toHaveCount(1);
  });
}

test("the public sitemap and feed exclude drafts and retired routes", async ({
  request,
}) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  const feed = await (await request.get("/index.xml")).text();

  for (const path of ["/project-one/", "/writing-one/"]) {
    expect(sitemap).toContain(path);
    expect(feed).toContain(path);
  }
  for (const path of ["/draft-notes/", "/blog/", "/projects/"]) {
    expect(sitemap).not.toContain(path);
    expect(feed).not.toContain(path);
  }
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

test("unknown routes return a missing-page status", async ({ request }) => {
  const response = await request.get("/not-a-real-entry/");
  expect(response.status()).toBe(404);
});
