"use client";

import { Box, Flex, Grid, GridItem, LinkBox, LinkOverlay, Stack, Text } from "@chakra-ui/react";
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

function FeedEntry({ item }: { item: FeedItem }) {
    return (
        <TiltCard style={{ marginBottom: "1rem" }}>
        <LinkBox
            as="article"
            py={{ base: 6, md: 8 }}
            px={{ base: 5, md: 8 }}
            sx={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.78), rgba(241,244,243,0.52))",
                "&:hover": {
                    background: "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(241,244,243,0.72))",
                    "& .feed-title": { color: "var(--chakra-colors-brand-500)" },
                },
            }}
            backdropFilter="blur(12px)"
            border="1px solid"
            borderColor="surface.containerHighest"
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
                        sx={{ "& img": { transition: "transform 0.6s ease" }, "&:hover img": { transform: "scale(1.06)" } }}
                    >
                        <Image
                            src={item.image_src}
                            alt={item.image_alt}
                            fill
                            style={{ objectFit: "cover" }}
                        />
                    </Box>
                </GridItem>

                {/* Text block */}
                <GridItem>
                    <Flex gap={4} mb={3} alignItems="center">
                        <Text
                            fontSize="9px"
                            letterSpacing="0.12em"
                            textTransform="uppercase"
                            color="ink.faint"
                        >
                            {item.date}
                        </Text>
                        <Tags tags={item.tags} />
                    </Flex>

                    <Text
                        className="feed-title"
                        fontFamily="heading"
                        fontStyle="italic"
                        fontSize={{ base: "xl", md: "2xl" }}
                        lineHeight="1.2"
                        letterSpacing="-0.01em"
                        bgGradient="linear(to-br, ink.primary, brand.500)"
                        bgClip="text"
                        mb={3}
                        transition="color 0.15s ease"
                    >
                        <LinkOverlay as={NextLink} href={item.url}>
                            {item.title}
                        </LinkOverlay>
                    </Text>

                    <Text fontFamily="body" fontSize="sm" color="ink.muted" lineHeight="1.7">
                        {item.description}
                    </Text>
                </GridItem>
            </Grid>
        </LinkBox>
        </TiltCard>
    );
}

/** Renders a feed of items (blog posts) in an editorial list layout. */
export function Feed({ title, subtitle, items }: FeedProps) {
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
            {items && items.length > 0 ? (
                items.map((item) => <FeedEntry key={item.id} item={item} />)
            ) : (
                <Text fontSize="sm" color="ink.muted" py={12}>
                    No posts yet.
                </Text>
            )}
        </Box>
    );
}
