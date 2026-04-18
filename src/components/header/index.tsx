"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { NavLink, MainContainer } from "components";
import { menuItems } from "config/menu-items";
import { usePathname } from "next/navigation";
import { environment } from "../../environment";

function NavItem({ href, pathname, children }: React.PropsWithChildren<{ href: string; pathname: string }>) {
    const active = href === pathname || (href !== "/" && pathname.includes(href));
    return (
        <NavLink href={href} variant={active ? "active" : "inactive"} fontSize="xs" letterSpacing="0.1em">
            {(children as string)?.toUpperCase()}
        </NavLink>
    );
}

export function Header() {
    const pathname = usePathname();
    return (
        <Box
            as="header"
            position="fixed"
            width="100%"
            zIndex={1000}
            backgroundColor="rgba(249, 249, 248, 0.82)"
            backdropFilter="saturate(180%) blur(4px)"
            borderColor="surface.containerHighest"
            py={4}
        >
            <MainContainer>
                <Flex direction="row" alignItems="center" width="100%">
                    {/* Wordmark */}
                    <Text
                        fontFamily="heading"
                        fontStyle="italic"
                        fontSize="xl"
                        color="ink.primary"
                        letterSpacing="-0.01em"
                        flexShrink={0}
                    >
                        {environment.NEXT_PUBLIC_METADATA_AUTHOR.replace(/['"]+/g, "")}
                    </Text>

                    {/* Nav links */}
                    <Flex direction="row" gap={8} ml="auto" alignItems="center">
                        {Array.from(menuItems, ([key, value]) => (
                            <NavItem key={key} href={key} pathname={pathname}>
                                {value.displayName}
                            </NavItem>
                        ))}
                    </Flex>
                </Flex>
            </MainContainer>
        </Box>
    );
}
