"use client";

import { Stack } from "@chakra-ui/react";
import { NavLink } from "components/link/NavLink";
import { menuItems } from "menu-items";

export function Header() {
    return (
        <Stack spacing={8} direction="row">
            {Array.from(menuItems, ([key, value]) => (
                <NavLink href={key} key={key}>
                    {value.name}
                </NavLink>
            ))}
        </Stack>
    );
}
