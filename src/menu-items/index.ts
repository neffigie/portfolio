/** Represents a sinigle menu item. */
export type MenuItem = {
	/** The route name. */
	name: string;

	/** If `true` this menu item will trigger a NProgress start event. */
	useNProgress: boolean;
};

/** Maps a `href` to a {@link MenuItem}. */
export const menuItems = new Map([
	["/blog/ai-platforming", { name: "blog", useNProgress: true }],
	["/", { name: "home", useNProgress: false }],
]) satisfies Map<string, MenuItem>;
