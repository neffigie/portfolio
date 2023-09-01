"use client";

import { Link } from "router";

import { usePathname } from "next/navigation";
import { Link as ChakraLink, Flex, LinkProps, Stack, Text } from "@chakra-ui/react";
import { FiExternalLink } from "react-icons/fi";

export interface NavLinkProps extends LinkProps {
    /** The link `href`. */
    href: string;
}

export function NavLink({ href, children, isExternal }: React.PropsWithChildren<NavLinkProps>) {
    const pathname = usePathname();
    return (
        <ChakraLink as={Link} href={href} style={{ fontWeight: pathname === href ? "bold" : undefined }} isExternal={isExternal}>
            <Stack direction="row">
                <Text>{children}</Text>
                <Flex alignItems="center">{isExternal && <FiExternalLink />}</Flex>
            </Stack>
        </ChakraLink>
    );
}
