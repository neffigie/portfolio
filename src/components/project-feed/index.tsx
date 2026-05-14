"use client";

import { Box, Button, Flex, Grid, GridItem, LinkBox, LinkOverlay, Skeleton, SkeletonText, Text } from "@chakra-ui/react";
import { FeedItem } from "components/feed";
import { Tags } from "components/tags";
import { TiltCard } from "components/tilt-card";
import Image from "next/image";
import NextLink from "next/link";

export interface ProjectFeedProps {
    items: FeedItem[] | undefined;
    isLoading?: boolean;
}

const PLACEHOLDER_ITEMS: FeedItem[] = Array.from({ length: 2 }, (_, i) => ({
    id: String(i),
    image_src: "",
    image_alt: "",
    title: "",
    tags: [],
    description: "",
    date: "",
    url: "#",
}));

function ProjectEntry({ item, index, isLoading }: { item: FeedItem; index: number; isLoading?: boolean }) {
    const isEven = index % 2 === 0;

    return (
        <TiltCard style={{ marginBottom: "1rem", pointerEvents: isLoading ? "none" : undefined }}>
        <LinkBox
            as="article"
            p={{ base: 6, md: 10 }}
            sx={{
                background: "linear-gradient(135deg, rgba(255,249,246,0.86), rgba(243,228,232,0.48))",
                "&:hover": { background: "linear-gradient(135deg, rgba(255,249,246,0.94), rgba(232,212,218,0.64))" },
            }}
            backdropFilter="blur(12px)"
            border="1px solid"
            borderColor="surface.border"
            borderRadius="xl"
            transition="all 0.15s ease"
        >
            <Grid
                templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                gap={{ base: 8, md: 16 }}
                alignItems="center"
            >
                {/* Image */}
                <GridItem order={{ base: 0, md: isEven ? 0 : 1 }}>
                    <Box
                        overflow="hidden"
                        position="relative"
                        height={{ base: "260px", md: "400px" }}
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
                                sizes="(max-width: 768px) calc(100vw - 48px), 50vw"
                                style={{ objectFit: "cover" }}
                            />
                        )}
                    </Box>
                </GridItem>

                {/* Text */}
                <GridItem order={{ base: 1, md: isEven ? 1 : 0 }}>
                    {isLoading ? (
                        <Skeleton height="10px" width="140px" startColor="surface.soft" endColor="surface.border" mb={2} />
                    ) : (
                        <Text
                            fontSize="9px"
                            letterSpacing="0.14em"
                            textTransform="uppercase"
                            color="ink.muted"
                            mb={2}
                        >
                            {String(index + 1).padStart(2, "0")} / {item.tags[0]?.name ?? "Project"}
                        </Text>
                    )}

                    {isLoading ? (
                        <Skeleton
                            height={{ base: "36px", md: "44px" }}
                            width="70%"
                            borderRadius="sm"
                            startColor="surface.soft"
                            endColor="surface.border"
                            mb={4}
                        />
                    ) : (
                        <Text
                            fontFamily="heading"
                            fontStyle="italic"
                            fontSize={{ base: "3xl", md: "4xl" }}
                            lineHeight="1.1"
                            letterSpacing="-0.02em"
                            bgGradient="linear(to-br, ink.primary, accent.primary)"
                            bgClip="text"
                            mb={4}
                        >
                            <LinkOverlay
                                as={NextLink}
                                href={item.url}
                                target={item.url.startsWith("http") ? "_blank" : undefined}
                                rel={item.url.startsWith("http") ? "noopener noreferrer" : undefined}
                            >
                                {item.title}
                            </LinkOverlay>
                        </Text>
                    )}

                    <Flex gap={4} mb={4} alignItems="center">
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
                            item.tags.length > 0 && <Tags tags={item.tags} />
                        )}
                    </Flex>

                    {isLoading ? (
                        <SkeletonText noOfLines={3} spacing={2} startColor="surface.soft" endColor="surface.border" mb={8} />
                    ) : (
                        <Text fontFamily="body" fontSize="sm" color="ink.muted" lineHeight="1.8" mb={8}>
                            {item.description}
                        </Text>
                    )}

                    {isLoading ? (
                        <Skeleton height="38px" width="128px" borderRadius="lg" startColor="surface.soft" endColor="surface.border" />
                    ) : (
                        <Button
                            as={NextLink}
                            href={item.url}
                            target={item.url.startsWith("http") ? "_blank" : undefined}
                            rel={item.url.startsWith("http") ? "noopener noreferrer" : undefined}
                            size="sm"
                            fontSize="10px"
                            letterSpacing="0.1em"
                            textTransform="uppercase"
                            bg="accent.primary"
                            color="surface.elevated"
                            borderRadius="lg"
                            px={6}
                            py={5}
                            _hover={{ bg: "accent.primaryHover" }}
                        >
                            View project
                        </Button>
                    )}
                </GridItem>
            </Grid>
        </LinkBox>
        </TiltCard>
    );
}

/** Renders a list of projects in an alternating editorial layout. */
export function ProjectFeed({ items, isLoading }: ProjectFeedProps) {
    if (!isLoading && (!items || items.length === 0)) {
        return (
            <Box py={20} textAlign="center">
                <Text fontSize="sm" color="ink.muted">
                    No projects to display.
                </Text>
            </Box>
        );
    }

    const displayItems = isLoading ? PLACEHOLDER_ITEMS : items!;

    return (
        <Box>
            {displayItems.map((item, index) => (
                <ProjectEntry key={item.id} item={item} index={index} isLoading={isLoading} />
            ))}
        </Box>
    );
}
