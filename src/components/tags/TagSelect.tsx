"use client";

import { Skeleton, Checkbox, CheckboxGroup, Stack, Tag } from "@chakra-ui/react";
import { TagSelectProps } from "./types";

/** Displays a group of selectable tags. */
export default function TagSelect({ tags, ...props }: TagSelectProps) {
    return (
        <CheckboxGroup {...props}>
            <Stack spacing={[1, 5]} direction={["column", "row"]} paddingY={4}>
                {tags ? (
                    tags.map((tag) => (
                        <Tag
                            size="lg"
                            borderRadius="md"
                            justifyContent="center"
                            alignItems="center"
                            key={tag.id}
                            boxShadow="md"
                        >
                            <Checkbox value={tag.name}>{tag.name}</Checkbox>
                        </Tag>
                    ))
                ) : (
                    <Skeleton />
                )}
            </Stack>
        </CheckboxGroup>
    );
}
