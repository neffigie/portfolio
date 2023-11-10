"use client";

import { Flex, Show, Spacer, Text } from "@chakra-ui/react";
import { NavLink, MainContainer } from "components";
import { menuItems } from "config/menu-items";
import { environment } from "environment";
import { usePathname } from "next/navigation";
import { useState } from "react";

function HeaderLink({ href, pathname, children }: React.PropsWithChildren<{ href: string; pathname: string }>) {
    const [hover, setHover] = useState(false);
    const active = href === pathname || (href !== "/" && pathname.includes(href));
    return (
        <NavLink
            href={href}
            key={href}
            size="xl"
            marginLeft={4}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            variant={active ? "active" : "inactive"}
            color={hover ? "brand.900" : undefined}
        >
            {children}
        </NavLink>
    );
}

export function Header() {
    const pathname = usePathname();
    return (
        <Flex
            backgroundColor="whiteAlpha.600"
            backdropFilter="saturate(180%) blur(16px)"
            py={4}
            position="fixed"
            width="100%"
            as="header"
            display="flex"
            justifyContent="center"
            zIndex={1000}
        >
            <MainContainer justifyContent="center" left={0} right={0} margin="auto">
                <Flex direction="row" justifyContent="center" alignItems="flex-end" width="100%">
                    <Show above="md">
                        <Text fontSize="xl" color="gray.600">
                            {environment.NEXT_PUBLIC_METADATA_AUTHOR.replace(/['"]+/g, "")}
                        </Text>
                        <Spacer />
                    </Show>
                    {Array.from(menuItems, ([key, value]) => (
                        <HeaderLink key={key} href={key} pathname={pathname}>
                            {value.displayName}
                        </HeaderLink>
                    ))}
                </Flex>
            </MainContainer>
        </Flex>
    );
}
