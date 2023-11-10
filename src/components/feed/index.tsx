"use client";

import {
    Card,
    CardBody,
    CardFooter,
    Heading,
    LinkBox,
    LinkOverlay,
    Stack,
    StackProps,
    Text,
    Wrap,
    WrapItem,
} from "@chakra-ui/react";
import { Tag, Tags } from "components/tags";
import Image from "next/image";
import NextLink from "next/link";
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
            <Heading color="brand.800">{title}</Heading>
            <Text fontSize="2xl">{subtitle}</Text>
            <Stack {...props}>
                {items ? (
                    items.map((item) => (
                        <LinkBox key={item.id} paddingBottom={2}>
                            <Card direction="column" overflow="hidden" boxShadow="xl">
                                <Image
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    style={{
                                        width: "100%",
                                        maxHeight: "300px",
                                        objectFit: "cover",
                                    }}
                                    src={item.image_src}
                                    alt={item.image_alt}
                                />
                                <Stack width="100%">
                                    <CardBody>
                                        <Heading size="md" color="brand.700">
                                            <LinkOverlay as={NextLink} href={item.url} verticalAlign="center">
                                                {item.title}
                                            </LinkOverlay>
                                            <FiExternalLink
                                                style={{
                                                    display: "inline",
                                                    marginLeft: "4px",
                                                }}
                                            />
                                        </Heading>
                                        <Text mt={2}>{item.description}</Text>
                                    </CardBody>
                                    <CardFooter>
                                        <Wrap width="100%" justifyContent="flex-end">
                                            <WrapItem flexGrow={1} minWidth="300px">
                                                <Text fontSize="sm" as="b" color="gray.600" alignSelf="flex-end">
                                                    {item.date}
                                                </Text>
                                            </WrapItem>
                                            <WrapItem>
                                                <Tags tags={item.tags} />
                                            </WrapItem>
                                        </Wrap>
                                    </CardFooter>
                                </Stack>
                            </Card>
                        </LinkBox>
                    ))
                ) : (
                    <Text>No content.</Text>
                )}
            </Stack>
        </>
    );
}
