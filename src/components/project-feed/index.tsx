"use client";

import { Box, Flex, Grid, GridItem, LinkBox, LinkOverlay, Text, Button } from "@chakra-ui/react";
import { FeedItem } from "components/feed";
import { Tags } from "components/tags";
import { TiltCard } from "components/tilt-card";
import Image from "next/image";
import NextLink from "next/link";

export interface ProjectFeedProps {
    items: FeedItem[] | undefined;
}

function ProjectEntry({ item, index }: { item: FeedItem; index: number }) {
    const isEven = index % 2 === 0;

    return (
        <TiltCard style={{ marginBottom: "1rem" }}>
        <LinkBox
            as="article"
            p={{ base: 6, md: 10 }}
            sx={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.78), rgba(241,244,243,0.52))",
                "&:hover": { background: "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(241,244,243,0.72))" },
            }}
            backdropFilter="blur(12px)"
            border="1px solid"
            borderColor="surface.containerHighest"
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
                        <Image
                            src={item.image_src}
                            alt={item.image_alt}
                            fill
                            style={{ objectFit: "cover" }}
                        />
                    </Box>
                </GridItem>

                {/* Text */}
                <GridItem order={{ base: 1, md: isEven ? 1 : 0 }}>
                    <Text
                        fontSize="9px"
                        letterSpacing="0.14em"
                        textTransform="uppercase"
                        color="ink.muted"
                        mb={2}
                    >
                        {String(index + 1).padStart(2, "0")} / {item.tags[0]?.name ?? "Project"}
                    </Text>

                    <Text
                        fontFamily="heading"
                        fontStyle="italic"
                        fontSize={{ base: "3xl", md: "4xl" }}
                        lineHeight="1.1"
                        letterSpacing="-0.02em"
                        bgGradient="linear(to-br, ink.primary, brand.500)"
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

                    <Flex gap={4} mb={4} alignItems="center">
                        <Text
                            fontSize="9px"
                            letterSpacing="0.12em"
                            textTransform="uppercase"
                            color="ink.faint"
                        >
                            {item.date}
                        </Text>
                        {item.tags.length > 0 && <Tags tags={item.tags} />}
                    </Flex>

                    <Text fontFamily="body" fontSize="sm" color="ink.muted" lineHeight="1.8" mb={8}>
                        {item.description}
                    </Text>

                    <Button
                        as={NextLink}
                        href={item.url}
                        target={item.url.startsWith("http") ? "_blank" : undefined}
                        rel={item.url.startsWith("http") ? "noopener noreferrer" : undefined}
                        size="sm"
                        fontSize="10px"
                        letterSpacing="0.1em"
                        textTransform="uppercase"
                        bg="brand.500"
                        color="white"
                        borderRadius="lg"
                        px={6}
                        py={5}
                        _hover={{ bg: "brand.600" }}
                    >
                        View project
                    </Button>
                </GridItem>
            </Grid>
        </LinkBox>
        </TiltCard>
    );
}

/** Renders a list of projects in an alternating editorial layout. */
export function ProjectFeed({ items }: ProjectFeedProps) {
    if (!items || items.length === 0) {
        return (
            <Box py={20} textAlign="center">
                <Text fontSize="sm" color="ink.muted">
                    No projects to display.
                </Text>
            </Box>
        );
    }

    return (
        <Box>
            {items.map((item, index) => (
                <ProjectEntry key={item.id} item={item} index={index} />
            ))}
        </Box>
    );
}
