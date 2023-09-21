"use client";

import { Flex, Stack } from "@chakra-ui/react";
import { Sticky, NavLink } from "components";
import { menuItems } from "menu-items";

export function Header() {
    return (
        <Sticky backgroundColor="whiteAlpha.800" p={2} position="fixed">
            <Flex justifyContent="center">
                <Stack spacing={8} direction="row" justifyContent="center">
                    {Array.from(menuItems, ([key, value]) => (
                        <NavLink href={key} key={key}>
                            {value.name}
                        </NavLink>
                    ))}
                </Stack>
            </Flex>
        </Sticky>
    );
}
