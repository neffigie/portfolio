"use client";

import { Tag, Wrap, WrapItem } from "@chakra-ui/react";
import { TagsProps } from "./types";

/** Displays a group of tag(s). */
export default function Tags({ tags, ...props }: TagsProps) {
    const getItem = (name: string, key?: string) => (
        <WrapItem key={key}>
            <Tag bgGradient="linear(to-l, teal.100, cyan.100)" padding={2}>
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
