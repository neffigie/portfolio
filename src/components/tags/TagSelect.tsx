"use client";

import { Box, Flex, Skeleton, Text } from "@chakra-ui/react";
import { TagSelectProps } from "./types";

/**
 * Displays a row of selectable filter pills.
 * Uses CheckboxGroup semantics (value / onChange) but renders as glass pill buttons.
 */
export default function TagSelect({ tags, value, onChange }: TagSelectProps) {
    const selected = (value as string[]) ?? [];

    const toggle = (name: string) => {
        if (!onChange) return;
        if (selected.includes(name)) {
            onChange(selected.filter((v) => v !== name));
        } else {
            onChange([...selected, name]);
        }
    };

    if (!tags) return <Skeleton height="32px" width="200px" />;

    return (
        <Flex direction="row" gap={2} flexWrap="wrap" py={4}>
            {tags.map((tag) => {
                const active = selected.includes(tag.name);
                return (
                    <Box
                        key={tag.id}
                        as="button"
                        onClick={() => toggle(tag.name)}
                        fontSize="10px"
                        letterSpacing="0.1em"
                        textTransform="uppercase"
                        fontFamily="body"
                        px={4}
                        py="6px"
                        borderRadius="full"
                        border="1px solid"
                        bg={active ? "accent.primary" : "rgba(255,249,246,0.78)"}
                        color={active ? "surface.elevated" : "ink.muted"}
                        borderColor={active ? "accent.primary" : "surface.border"}
                        backdropFilter={active ? "none" : "blur(8px)"}
                        transition="all 0.15s ease"
                        _hover={{
                            bg: active ? "accent.primaryHover" : "rgba(232,212,218,0.42)",
                            color: active ? "surface.elevated" : "ink.primary",
                        }}
                        cursor="pointer"
                    >
                        <Text as="span" fontSize="inherit" color="inherit" letterSpacing="inherit">
                            {tag.name}
                        </Text>
                    </Box>
                );
            })}
        </Flex>
    );
}
