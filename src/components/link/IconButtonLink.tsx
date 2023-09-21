"use client";

import Link from "next/link";
import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { Url } from "next/dist/shared/lib/router/router";

export interface IconButtonLinkProps extends IconButtonProps {
    /**
     * The path or URL to navigate to. It can also be an object.
     * @privateremarks from the Next.js docs
     */
    href: Url;
}

/** An `IconButton` that can link to other pages using the `href` prop. */
export const IconButtonLink = ({ href, ...props }: IconButtonLinkProps) => (
    <Link href={href} passHref target="_blank">
        <IconButton {...props} as="a" />
    </Link>
);
