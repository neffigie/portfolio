import { CheckboxGroupProps } from "@chakra-ui/react";
import type { HTMLAttributes } from "react";

/** A single tag. */
export type Tag = {
    /** The id of the tag. */
    id: string;

    /** The name of the tag. */
    name: string;
};

export interface TagsProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
    /** The tag(s). */
    tags: Tag | Tag[];
}

export interface TagSelectProps extends CheckboxGroupProps {
    tags: Tag[] | null;
}
