/** Represents a sinigle menu item. */
export type MenuItem = {
    /** The route name in UI. */
    displayName: string;
};

/** The path name of the blog page. */
export const BlogPathName = "/blog";

/** The path name of the home page. */
export const HomePathName = "/";

/** Maps each pathname `href` to a {@link MenuItem}. */
export const menuItems = new Map([
    [BlogPathName, { displayName: "blog" }],
    [HomePathName, { displayName: "home" }],
] as const satisfies ReadonlyArray<readonly [string, MenuItem]>);

/** Returns `true` if the current `href` should show some type of loading UI, `false` otherwise. */
export function isLoadingRoute(href: string): boolean {
    return href.includes(BlogPathName);
}
