import { isLoadingRoute } from "config";
import NProgress from "nprogress";

NProgress.configure({ minimum: 0.12, showSpinner: false, trickleSpeed: 180 });

/**
 * Callback on route start.
 * @param href The route href.
 */
export function onStart(href: string) {
    if (isLoadingRoute(href)) NProgress.start();
}

/** Callback on route complete. */
export function onComplete() {
    NProgress.done();
}
