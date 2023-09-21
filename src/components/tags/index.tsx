"use client";

import { Tag, Wrap, WrapItem, WrapProps } from "@chakra-ui/react";

export interface TagsProps {
    /** The tag(s). */
    tags: Tag | Tag[];
}

/** A single tag. */
export type Tag = {
    /** The id of the tag. */
    id: string;

    /** The name of the tag. */
    name: string;
};

/** Displays a group of tag(s). */
export const Tags = ({ tags, ...props }: TagsProps & WrapProps) => {
    const getItem = (name: string, key?: string) => (
        <WrapItem key={key}>
            <Tag>{name}</Tag>
        </WrapItem>
    );
    return <Wrap {...props}>{Array.isArray(tags) ? tags.map((tag) => getItem(tag.name, tag.id)) : getItem(tags.name)}</Wrap>;
};
