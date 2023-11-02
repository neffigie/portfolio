"use client";

import { Link as NextLink } from "router";
import { Link as ChakraLink, LinkProps } from "@chakra-ui/react";
import { FiExternalLink } from "react-icons/fi";

export interface NavLinkProps extends LinkProps {
    /** The link `href`. */
    href: string;
}

/** A link intended to be used in-line with text. */
export function NavLink({ href, children, ...props }: React.PropsWithChildren<NavLinkProps>) {
    return (
        <ChakraLink as={NextLink} href={href} {...props}>
            {children}
            {props.variant === "external" && (
                <FiExternalLink
                    style={{ display: "inline-block", alignSelf: "center", marginLeft: "4px", marginRight: "4px" }}
                />
            )}
        </ChakraLink>
    );
}
