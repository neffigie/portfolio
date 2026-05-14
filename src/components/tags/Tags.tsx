"use client";

import { Tag, Wrap, WrapItem } from "@chakra-ui/react";
import { TagsProps } from "./types";

/** Displays a group of soft accent tag chip(s). */
export default function Tags({ tags, ...props }: TagsProps) {
    const getItem = (name: string, key?: string) => (
        <WrapItem key={key}>
            <Tag
                fontSize="9px"
                letterSpacing="0.1em"
                textTransform="uppercase"
                bg="rgba(234,223,194,0.42)"
                backdropFilter="blur(8px)"
                color="ink.muted"
                border="1px solid"
                borderColor="rgba(216,190,198,0.55)"
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
