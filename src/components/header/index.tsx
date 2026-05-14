"use client";

import { Flex, Text, Box } from "@chakra-ui/react";
import { GlassPanel } from "components/glass";
import { NavLink } from "components/link";
import { menuItems } from "config/menu-items";
import { usePathname } from "next/navigation";
import { environment } from "../../environment";

function NavItem({ href, pathname, children }: React.PropsWithChildren<{ href: string; pathname: string }>) {
    const active = href === pathname || (href !== "/" && pathname.includes(href));
    return (
        <NavLink href={href} variant={active ? "active" : "inactive"} fontSize="11px" letterSpacing="0.14em">
            {(children as string)?.toUpperCase()}
        </NavLink>
    );
}

export function Header() {
    const pathname = usePathname();
    const author = environment.NEXT_PUBLIC_METADATA_AUTHOR.replace(/['"]+/g, "");

    return (
        <Box
            as="header"
            position="fixed"
            top={0}
            left={0}
            right={0}
            zIndex={1000}
            pointerEvents="none"
        >
            <GlassPanel
                profile="bar"
                cornerRadius={0}
                displacementScale={35}
                edgeThickness={20}
                blurAmount={1.4}
                padding="0"
                style={{
                    display: "block",
                    pointerEvents: "auto",
                    width: "100%",
                    borderLeft: 0,
                    borderRight: 0,
                    borderTop: 0,
                    boxShadow:
                        "inset 0 1.5px 0 rgba(255,255,255,0.95), 0 2px 32px rgba(60,40,50,0.06)",
                }}
            >
                <Flex
                    px={{ base: 6, md: 10 }}
                    py={3}
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Text
                        fontFamily="heading"
                        fontStyle="italic"
                        fontWeight="400"
                        fontSize="21px"
                        color="ink.primary"
                        letterSpacing="-0.01em"
                        flexShrink={0}
                        lineHeight="1"
                    >
                        {author}
                        <Box as="span" color="accent.primary">.</Box>
                    </Text>

                    <Flex direction="row" gap={{ base: 4, md: 7 }} alignItems="center" minW={0}>
                        {Array.from(menuItems, ([key, value]) => (
                            <NavItem key={key} href={key} pathname={pathname}>
                                {value.displayName}
                            </NavItem>
                        ))}
                    </Flex>
                </Flex>
            </GlassPanel>
        </Box>
    );
}
