"use client";

import Link from "next/link";
import { IconButton, IconButtonProps } from "@chakra-ui/react";

export interface IconButtonLinkProps extends IconButtonProps {
    href: string;
}

/** An `IconButton` that can link to other pages using the `href` prop. */
export const IconButtonLink = ({ href, ...props }: IconButtonLinkProps) => (
    <IconButton as={Link} href={href} target="_blank" {...props} />
);
