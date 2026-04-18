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
                        bg={active ? "brand.500" : "rgba(249,249,248,0.7)"}
                        color={active ? "white" : "ink.muted"}
                        borderColor={active ? "brand.500" : "surface.containerHighest"}
                        backdropFilter={active ? "none" : "blur(8px)"}
                        transition="all 0.15s ease"
                        _hover={{
                            bg: active ? "brand.600" : "rgba(209, 231, 224, 0.5)",
                            color: active ? "white" : "ink.primary",
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
