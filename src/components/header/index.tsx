"use client";

import { Flex, Spacer, Text } from "@chakra-ui/react";
import { Sticky, NavLink } from "components";
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
            paddingLeft={4}
            textDecoration="underline"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            textDecorationColor={active ? "black" : "gray.600"}
            color={active || hover ? "black" : "gray.600"}
            style={{ fontWeight: active ? "bold" : undefined, display: "inline-flex" }}
        >
            {children}
        </NavLink>
    );
}

export function Header() {
    const pathname = usePathname();
    return (
        <Sticky
            backgroundColor="whiteAlpha.800"
            py={4}
            px={2}
            position="fixed"
            left={0}
            right={0}
            margin="auto"
            width="100%"
            maxWidth="2xl"
        >
            <Flex direction="row" justifyContent="center" alignItems="flex-end" width="100%">
                <Text fontSize="xl" color="gray.600">
                    {environment.NEXT_PUBLIC_METADATA_AUTHOR.replace(/['"]+/g, "")}
                </Text>
                <Spacer />
                {Array.from(menuItems, ([key, value]) => (
                    <HeaderLink key={key} href={key} pathname={pathname}>
                        {value.displayName}
                    </HeaderLink>
                ))}
            </Flex>
        </Sticky>
    );
}
