"use client";

import {
    Card,
    CardBody,
    CardFooter,
    Flex,
    Heading,
    LinkBox,
    LinkOverlay,
    Skeleton,
    Stack,
    StackProps,
    Text,
} from "@chakra-ui/react";
import { Tag, Tags } from "components/tags";
import Image from "next/image";
import NextLink from "next/link";
import { Suspense } from "react";
import { FiExternalLink } from "react-icons/fi";

export interface FeedProps extends StackProps {
    /** The title of the feed. */
    title: string;

    /** The feed subtitle. */
    subtitle: string;

    /** The items that make up the feed. */
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
export function Feed({ title, subtitle, items, ...props }: FeedProps) {
    return (
        <>
            <Heading>{title}</Heading>
            <Text fontSize="2xl">{subtitle}</Text>
            <Stack {...props}>
                {items ? (
                    items.map((item) => (
                        <Suspense fallback={<Skeleton />} key={item.id}>
                            <LinkBox>
                                <Card direction="row" overflow="hidden" boxShadow="xl">
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
                                                <Suspense fallback={<Skeleton />}>
                                                    <Heading size="md">
                                                        <LinkOverlay as={NextLink} href={item.url}>
                                                            {item.title}
                                                        </LinkOverlay>
                                                    </Heading>
                                                </Suspense>
                                                <Flex alignItems="center">
                                                    <FiExternalLink />
                                                </Flex>
                                            </Stack>
                                            <Text mt={2}>{item.description}</Text>
                                        </CardBody>
                                        <CardFooter width="100%" justifyContent="flex-end" alignItems="flex-end">
                                            <Text flex={1} fontSize="sm" as="b" color="gray.600">
                                                {item.date}
                                            </Text>
                                            <Tags tags={item.tags} />
                                        </CardFooter>
                                    </Stack>
                                </Card>
                            </LinkBox>
                        </Suspense>
                    ))
                ) : (
                    <Text>No content.</Text>
                )}
            </Stack>
        </>
    );
}
