/** Represents a sinigle menu item. */
export type MenuItem = {
    /** The route name in UI. */
    name: string;

    /** If `true` this menu item will trigger a NProgress start event. */
    useNProgress: boolean;
};

/** Maps each pathname `href` to a {@link MenuItem}. */
export const menuItems = new Map([
    ["/blog/ai-platforming", { name: "blog", useNProgress: true }],
    ["/", { name: "home", useNProgress: false }],
]) satisfies Map<string, MenuItem>;
