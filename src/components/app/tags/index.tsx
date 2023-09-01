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
	return (
		<Wrap {...props}>
			{Array.isArray(tags) ? (
				tags.map((tag) => (
					<WrapItem key={tag.id}>
						<Tag>{tag.name}</Tag>
					</WrapItem>
				))
			) : (
				<WrapItem>
					<Tag>{tags.name}</Tag>
				</WrapItem>
			)}
		</Wrap>
	);
};
