import { menuItems } from "menu-items";
import NProgress from "nprogress";

/**
 * Callback on route start.
 * @param href The route href.
 */
export function onStart(href: string) {
	if (menuItems.get(href)?.useNProgress) NProgress.start();
}

/** Callback on route complete. */
export function onComplete() {
	NProgress.done();
}
