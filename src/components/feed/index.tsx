"use client";

import { Box, Flex, Grid, GridItem, LinkBox, LinkOverlay, Skeleton, SkeletonText, Stack, Text } from "@chakra-ui/react";
import { Tag, Tags } from "components/tags";
import { TiltCard } from "components/tilt-card";
import Image from "next/image";
import NextLink from "next/link";

export interface FeedProps {
    /** The title of the feed. Omit to hide the header entirely. */
    title?: string;

    /** The feed subtitle. */
    subtitle?: string;

    /** The items that make up the feed. */
    items: FeedItem[] | undefined;

    isLoading?: boolean;
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

const PLACEHOLDER_ITEMS: FeedItem[] = Array.from({ length: 3 }, (_, i) => ({
    id: String(i),
    image_src: "",
    image_alt: "",
    title: "",
    tags: [],
    description: "",
    date: "",
    url: "#",
}));

function FeedEntry({ item, isLoading }: { item: FeedItem; isLoading?: boolean }) {
    return (
        <TiltCard style={{ marginBottom: "1rem", pointerEvents: isLoading ? "none" : undefined }}>
        <LinkBox
            as="article"
            py={{ base: 6, md: 8 }}
            px={{ base: 5, md: 8 }}
            sx={{
                background: "linear-gradient(135deg, rgba(255,249,246,0.86), rgba(243,228,232,0.48))",
                "&:hover": {
                    background: "linear-gradient(135deg, rgba(255,249,246,0.94), rgba(232,212,218,0.64))",
                    "& .feed-title": { color: "var(--chakra-colors-accent-primary)" },
                },
            }}
            backdropFilter="blur(12px)"
            border="1px solid"
            borderColor="surface.border"
            borderRadius="xl"
            transition="all 0.15s ease"
        >
            <Grid templateColumns={{ base: "1fr", md: "200px 1fr" }} gap={{ base: 6, md: 10 }} alignItems="start">
                {/* Thumbnail */}
                <GridItem>
                    <Box
                        overflow="hidden"
                        position="relative"
                        height={{ base: "160px", md: "140px" }}
                        sx={!isLoading ? { "& img": { transition: "transform 0.6s ease" }, "&:hover img": { transform: "scale(1.06)" } } : {}}
                    >
                        {isLoading ? (
                            <Skeleton
                                height="100%"
                                width="100%"
                                borderRadius="sm"
                                startColor="surface.soft"
                                endColor="surface.border"
                            />
                        ) : (
                            <Image
                                src={item.image_src}
                                alt={item.image_alt}
                                fill
                                sizes="(max-width: 768px) calc(100vw - 40px), 200px"
                                style={{ objectFit: "cover" }}
                            />
                        )}
                    </Box>
                </GridItem>

                {/* Text block */}
                <GridItem>
                    <Flex gap={4} mb={3} alignItems="center">
                        {isLoading ? (
                            <Skeleton height="10px" width="80px" startColor="surface.soft" endColor="surface.border" />
                        ) : (
                            <Text fontSize="9px" letterSpacing="0.12em" textTransform="uppercase" color="ink.faint">
                                {item.date}
                            </Text>
                        )}
                        {isLoading ? (
                            <Flex gap={2}>
                                <Skeleton height="21px" width="52px" borderRadius="full" startColor="surface.soft" endColor="surface.border" />
                                <Skeleton height="21px" width="64px" borderRadius="full" startColor="surface.soft" endColor="surface.border" />
                            </Flex>
                        ) : (
                            <Tags tags={item.tags} />
                        )}
                    </Flex>

                    {isLoading ? (
                        <Skeleton
                            height={{ base: "24px", md: "28px" }}
                            width="70%"
                            borderRadius="sm"
                            startColor="surface.soft"
                            endColor="surface.border"
                            mb={3}
                        />
                    ) : (
                        <Text
                            className="feed-title"
                            fontFamily="heading"
                            fontStyle="italic"
                            fontSize={{ base: "xl", md: "2xl" }}
                            lineHeight="1.2"
                            letterSpacing="-0.01em"
                            bgGradient="linear(to-br, ink.primary, accent.primary)"
                            bgClip="text"
                            mb={3}
                            transition="color 0.15s ease"
                        >
                            <LinkOverlay as={NextLink} href={item.url}>
                                {item.title}
                            </LinkOverlay>
                        </Text>
                    )}

                    {isLoading ? (
                        <SkeletonText noOfLines={2} spacing={2} startColor="surface.soft" endColor="surface.border" />
                    ) : (
                        <Text fontFamily="body" fontSize="sm" color="ink.muted" lineHeight="1.7">
                            {item.description}
                        </Text>
                    )}
                </GridItem>
            </Grid>
        </LinkBox>
        </TiltCard>
    );
}

/** Renders a feed of items (blog posts) in an editorial list layout. */
export function Feed({ title, subtitle, items, isLoading }: FeedProps) {
    const displayItems = isLoading ? PLACEHOLDER_ITEMS : items;

    return (
        <Box>
            {/* Feed header — only rendered if title is provided */}
            {title && (
                <Stack mb={12} spacing={3}>
                    <Text
                        as="h1"
                        fontFamily="heading"
                        fontStyle="italic"
                        fontSize={{ base: "4xl", md: "5xl" }}
                        lineHeight="1.1"
                        letterSpacing="-0.02em"
                        color="ink.primary"
                    >
                        {title}
                    </Text>
                    {subtitle && (
                        <Text fontFamily="body" fontSize="sm" color="ink.muted" lineHeight="1.7">
                            {subtitle}
                        </Text>
                    )}
                </Stack>
            )}

            {/* Items */}
            {displayItems && displayItems.length > 0 ? (
                displayItems.map((item) => <FeedEntry key={item.id} item={item} isLoading={isLoading} />)
            ) : (
                !isLoading && (
                    <Text fontSize="sm" color="ink.muted" py={12}>
                        No posts yet.
                    </Text>
                )
            )}
        </Box>
    );
}
