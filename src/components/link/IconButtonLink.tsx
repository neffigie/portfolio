"use client";

import { IconButton, IconButtonProps } from "@chakra-ui/react";
import type { ComponentPropsWithoutRef } from "react";

type AnchorTarget = ComponentPropsWithoutRef<"a">["target"];

export interface IconButtonLinkProps extends Omit<IconButtonProps, "as"> {
    href: string;
    rel?: string;
    target?: AnchorTarget;
}

/** An `IconButton` that can link to other pages using the `href` prop. */
export const IconButtonLink = ({ href, rel = "noreferrer", target = "_blank", ...props }: IconButtonLinkProps) => (
    <IconButton as="a" href={href} rel={rel} target={target} {...props} />
);
