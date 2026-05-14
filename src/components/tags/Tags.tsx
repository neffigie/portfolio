"use client";

import { Tag, Wrap, WrapItem } from "@chakra-ui/react";
import { TagsProps } from "./types";

/** Displays a group of sea-glass tag chip(s). */
export default function Tags({ tags, ...props }: TagsProps) {
    const getItem = (name: string, key?: string) => (
        <WrapItem key={key}>
            <Tag
                fontSize="9px"
                letterSpacing="0.1em"
                textTransform="uppercase"
                bg="rgba(232,196,200,0.35)"
                backdropFilter="blur(8px)"
                color="ink.muted"
                border="1px solid"
                borderColor="rgba(235,184,194,0.5)"
                borderRadius="full"
                px={3}
                py={1}
                fontFamily="body"
            >
                {name}
            </Tag>
        </WrapItem>
    );
    return (
        <Wrap {...props}>
            {Array.isArray(tags) ? tags.map((tag) => getItem(tag.name, tag.id)) : getItem(tags.name)}
        </Wrap>
    );
}
