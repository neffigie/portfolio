"use client";

import { useRouter } from "router";
import type { AnchorHTMLAttributes, CSSProperties, MouseEvent, PropsWithChildren } from "react";
import { FiExternalLink } from "react-icons/fi";

export interface NavLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color" | "href"> {
    /** The link `href`. */
    href: string;
    fontSize?: CSSProperties["fontSize"];
    letterSpacing?: CSSProperties["letterSpacing"];
    variant?: "active" | "external" | "inactive";
}

/** A link intended to be used in-line with text. */
export function NavLink({
    href,
    children,
    fontSize,
    letterSpacing,
    onClick,
    onMouseEnter,
    style,
    variant,
    ...props
}: PropsWithChildren<NavLinkProps>) {
    const router = useRouter();

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (event.defaultPrevented || !shouldUseClientNavigation(href, event)) return;

        event.preventDefault();
        router.push(href, undefined);
    };

    const handleMouseEnter = (event: MouseEvent<HTMLAnchorElement>) => {
        onMouseEnter?.(event);
        if (!event.defaultPrevented && shouldPrefetch(href)) {
            router.prefetch(href);
        }
    };

    const linkStyle = {
        ...getVariantStyle(variant),
        fontSize,
        letterSpacing,
        ...style,
    };

    return (
        <a href={href} onClick={handleClick} onMouseEnter={handleMouseEnter} style={linkStyle} {...props}>
            {children}
            {variant === "external" && (
                <FiExternalLink
                    style={{ display: "inline-block", alignSelf: "center", marginLeft: "4px", marginRight: "4px" }}
                />
            )}
        </a>
    );
}

function getVariantStyle(variant: NavLinkProps["variant"]): CSSProperties {
    switch (variant) {
        case "active":
            return {
                borderBottom: "1.5px solid var(--chakra-colors-accent-primary)",
                color: "var(--chakra-colors-ink-primary)",
                display: "inline-flex",
                fontWeight: 500,
                paddingBottom: "2px",
                textDecoration: "none",
            };
        case "external":
            return {
                color: "var(--chakra-colors-accent-primary)",
            };
        case "inactive":
            return {
                color: "var(--chakra-colors-ink-muted)",
                display: "inline-flex",
                fontWeight: 500,
                textDecoration: "none",
            };
        default:
            return {};
    }
}

function shouldPrefetch(href: string) {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (!url.pathname.startsWith("/")) return false;
    if (url.pathname === window.location.pathname && url.search === window.location.search) return false;

    return true;
}

function shouldUseClientNavigation(href: string, event: MouseEvent<HTMLAnchorElement>) {
    const target = event.currentTarget.getAttribute("target");
    if ((target && target !== "_self") || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return false;
    }
    if (event.nativeEvent.button === 1) return false;

    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (!url.pathname.startsWith("/")) return false;
    if (url.pathname === window.location.pathname && url.search === window.location.search) return false;

    return true;
}
