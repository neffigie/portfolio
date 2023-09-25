"use client";

import {
    Card,
    CardBody,
    CardFooter,
    Flex,
    Heading,
    LinkBox,
    LinkOverlay,
    Stack,
    StackProps,
    Text,
} from "@chakra-ui/react";
import { Tag, Tags } from "components/tags";
import Image from "next/image";
import NextLink from "next/link";
import { FiExternalLink } from "react-icons/fi";
import { isExternal } from "util/types";

export interface FeedProps extends StackProps {
    items: FeedItem[] | undefined;
}

/** An item in the feed. */
export interface FeedItem {
    /** The id of this item. */
    id: string;

    /** The preview image src. */
    image_src: string;

    /** The preview image alt text. */
    image_alt: string;

    /** The title. */
    title: string;

    /** The tag(s). */
    tags: Tag[];

    /** The description. */
    description: string;

    /** The date. */
    date: string;

    /** The URL to the content. */
    url: string;
}

/** Creates a feed with items that link to their content. */
export function Feed({ items, ...props }: FeedProps) {
    return (
        <Stack {...props}>
            {items ? (
                items.map((item) => (
                    <LinkBox key={item.id}>
                        <Card direction={{ base: "column", sm: "row" }} overflow="hidden" boxShadow="lg">
                            <Image
                                width={0}
                                height={0}
                                sizes="100vw"
                                style={{ width: "30%", height: "auto", objectFit: "cover" }}
                                src={item.image_src}
                                alt={item.image_alt}
                            />
                            <Stack width="100%">
                                <CardBody>
                                    <Stack direction="row">
                                        <Heading size="md">
                                            <LinkOverlay as={NextLink} href={item.url}>
                                                {item.title}
                                            </LinkOverlay>
                                        </Heading>
                                        <Flex alignItems="center">
                                            <FiExternalLink />
                                        </Flex>
                                    </Stack>
                                    <Text>{item.description}</Text>
                                </CardBody>
                                <CardFooter width="100%" justifyContent="flex-end" alignItems="flex-end">
                                    <Text flex={1} fontSize="sm">
                                        {item.date}
                                    </Text>
                                    <Tags tags={item.tags} />
                                </CardFooter>
                            </Stack>
                        </Card>
                    </LinkBox>
                ))
            ) : (
                <Text>No content.</Text>
            )}
        </Stack>
    );
}
