import { useRouter as useRouterOriginal } from "next/navigation";

import { onStart } from "../events";
import { shouldTriggerStartEvent } from "./should-trigger-start-event";
import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function useRouter(): ReturnType<typeof useRouterOriginal> {
    const router = useRouterOriginal();
    return {
        ...router,
        push: (href: string, options: NavigateOptions | undefined) => {
            if (shouldTriggerStartEvent(href)) onStart(href);
            router.push(href, options);
        },
        replace: (href: string, options: NavigateOptions | undefined) => {
            if (shouldTriggerStartEvent(href)) onStart(href);
            router.replace(href, options);
        },
    };
}
