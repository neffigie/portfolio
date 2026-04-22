"use client";

import { Box, Button, Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import { FeedItem } from "components/feed";
import { FluidText } from "components/fluid-text";
import { MainContainer } from "components/main-container";
import { TiltCard } from "components/tilt-card";
import Image from "next/image";
import Link from "next/link";
import { environment } from "../environment";
import { ResumeButton } from "components";

function Eyebrow({ children }: { children: string }) {
    return (
        <Text fontSize="10px" letterSpacing="0.14em" textTransform="uppercase" color="ink.muted" fontFamily="heading" mb={4}>
            <FluidText>{children}</FluidText>
        </Text>
    );
}

export function HomeContent({ featured, resumeUrl }: { featured: FeedItem[]; resumeUrl: string }) {
    return (
        <>
            {/* ── Hero ─────────────────────────────────────────────── */}
            <Box as="section" bg="surface.containerLow" py={{ base: 24, md: 36 }} overflow="hidden">
                <MainContainer>
                    <Eyebrow>The portfolio of</Eyebrow>
                    <Text
                        as="h1"
                        fontFamily="heading"
                        fontStyle="italic"
                        fontSize={{ base: "6xl", md: "8xl", lg: "9xl" }}
                        lineHeight="0.92"
                        letterSpacing="-0.02em"
                        mb={8}
                        maxW="14ch"
                    >
                        <FluidText gradient>{environment.NEXT_PUBLIC_METADATA_AUTHOR.replace(/['"]+/g, "") + "."}</FluidText>
                    </Text>
                    <Text
                        fontFamily="body"
                        fontSize={{ base: "sm", md: "md" }}
                        color="ink.muted"
                        maxW="44ch"
                        lineHeight="1.7"
                        mb={10}
                    >
                        <FluidText>{"A multidisciplinary creator: software engineer, game developer, and artistically driven builder. I craft systems that sit at the edge of code and lived experience."}</FluidText>
                    </Text>
                    <ResumeButton resumeUrl={resumeUrl}/>
                </MainContainer>
            </Box>

            {/* ── Concept ──────────────────────────────────────────── */}
            <Box as="section" bg="surface.bright" py={{ base: 20, md: 32 }}>
                <MainContainer>
                    <Grid templateColumns={{ base: "1fr", md: "1fr 1.6fr" }} gap={{ base: 10, md: 20 }}>
                        <GridItem>
                            <Text
                                fontFamily="heading"
                                fontStyle="italic"
                                fontSize={{ base: "2xl", md: "3xl" }}
                                color="ink.primary"
                                lineHeight="1.2"
                            >
                                The Concept
                            </Text>
                        </GridItem>
                        <GridItem>
                            <Text
                                fontFamily="heading"
                                fontStyle="italic"
                                fontSize={{ base: "lg", md: "xl" }}
                                color="ink.primary"
                                lineHeight="1.5"
                                mb={6}
                            >
                                &ldquo;The archive is not merely a storage of data, but a vessel for atmosphere. Every
                                project curated within these digital walls is an experiment in sensory
                                digitalism.&rdquo;
                            </Text>
                            <Text fontFamily="body" fontSize="sm" color="ink.muted" lineHeight="1.8">
                                In a world of noise, we prioritize the pause. The negative space is as vital as the
                                content it holds.
                            </Text>
                        </GridItem>
                    </Grid>
                </MainContainer>
            </Box>

            {/* ── Selected Fragments ───────────────────────────────── */}
            {featured.length > 0 && (
                <Box as="section" bg="surface.containerLow" py={{ base: 20, md: 32 }}>
                    <MainContainer>
                        <Flex justifyContent="space-between" alignItems="flex-end" mb={12}>
                            <Box>
                                <Eyebrow>Collection 00</Eyebrow>
                                <Text
                                    fontFamily="body"
                                    fontWeight="medium"
                                    fontSize={{ base: "2xl", md: "3xl" }}
                                    color="ink.primary"
                                    letterSpacing="-0.01em"
                                >
                                    Selected Fragments
                                </Text>
                            </Box>
                            <Text
                                as={Link}
                                href="/projects"
                                fontSize="10px"
                                letterSpacing="0.12em"
                                textTransform="uppercase"
                                color="ink.muted"
                                _hover={{ color: "ink.primary" }}
                                display={{ base: "none", md: "block" }}
                            >
                                View all work
                            </Text>
                        </Flex>

                        <Grid
                            templateColumns={{ base: "1fr", md: "5fr 3fr" }}
                            templateRows={{ base: "auto", md: "auto auto" }}
                            gap={4}
                        >
                            {/* First item — large left */}
                            {featured[0] && (
                                <GridItem rowSpan={{ md: 2 }}>
                                    <TiltCard>
                                    <Box
                                        as={Link}
                                        href={featured[0].url}
                                        display="block"
                                        overflow="hidden"
                                        position="relative"
                                        height={{ base: "240px", md: "100%" }}
                                        minH={{ md: "420px" }}
                                    >
                                        <Image
                                            src={featured[0].image_src}
                                            alt={featured[0].image_alt}
                                            fill
                                            style={{ objectFit: "cover" }}
                                        />
                                        <Box
                                            position="absolute"
                                            bottom={4}
                                            left={4}
                                            right={4}
                                            bg="rgba(249,249,248,0.88)"
                                            backdropFilter="blur(12px)"
                                            p={3}
                                        >
                                            <Text
                                                fontSize="9px"
                                                letterSpacing="0.12em"
                                                textTransform="uppercase"
                                                color="ink.muted"
                                                mb={1}
                                            >
                                                {featured[0].tags[0]?.name}
                                            </Text>
                                            <Text
                                                fontFamily="heading"
                                                fontStyle="italic"
                                                fontSize="lg"
                                                color="ink.primary"
                                                lineHeight="1.2"
                                            >
                                                {featured[0].title}
                                            </Text>
                                        </Box>
                                    </Box>
                                    </TiltCard>
                                </GridItem>
                            )}

                            {/* Second item — top right */}
                            {featured[1] && (
                                <GridItem>
                                    <TiltCard>
                                    <Box
                                        as={Link}
                                        href={featured[1].url}
                                        display="block"
                                        overflow="hidden"
                                        position="relative"
                                        height={{ base: "200px", md: "200px" }}
                                    >
                                        <Image
                                            src={featured[1].image_src}
                                            alt={featured[1].image_alt}
                                            fill
                                            style={{ objectFit: "cover" }}
                                        />
                                    </Box>
                                    <Box mt={2}>
                                        <Text
                                            fontSize="9px"
                                            letterSpacing="0.12em"
                                            textTransform="uppercase"
                                            color="ink.muted"
                                            mb={1}
                                        >
                                            {featured[1].tags[0]?.name}
                                        </Text>
                                        <Text fontFamily="heading" fontStyle="italic" fontSize="md" color="ink.primary">
                                            {featured[1].title}
                                        </Text>
                                    </Box>
                                    </TiltCard>
                                </GridItem>
                            )}

                            {/* Third item — bottom right */}
                            {featured[2] && (
                                <GridItem>
                                    <TiltCard>
                                    <Box
                                        as={Link}
                                        href={featured[2].url}
                                        display="block"
                                        overflow="hidden"
                                        position="relative"
                                        height={{ base: "200px", md: "200px" }}
                                    >
                                        <Image
                                            src={featured[2].image_src}
                                            alt={featured[2].image_alt}
                                            fill
                                            style={{ objectFit: "cover" }}
                                        />
                                    </Box>
                                    <Box mt={2}>
                                        <Text
                                            fontSize="9px"
                                            letterSpacing="0.12em"
                                            textTransform="uppercase"
                                            color="ink.muted"
                                            mb={1}
                                        >
                                            {featured[2].tags[0]?.name}
                                        </Text>
                                        <Text fontFamily="heading" fontStyle="italic" fontSize="md" color="ink.primary">
                                            {featured[2].title}
                                        </Text>
                                    </Box>
                                    </TiltCard>
                                </GridItem>
                            )}
                        </Grid>
                    </MainContainer>
                </Box>
            )}

            {/* ── CTA ──────────────────────────────────────────────── */}
            <Box as="section" bg="surface.bright" py={{ base: 24, md: 40 }} textAlign="center">
                <MainContainer>
                    <Text
                        fontFamily="heading"
                        fontStyle="italic"
                        fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
                        lineHeight="1.1"
                        letterSpacing="-0.02em"
                        color="ink.primary"
                        mb={8}
                    >
                        The journey begins within.
                    </Text>
                    <Text
                        as={Link}
                        href="/blog"
                        fontSize="10px"
                        letterSpacing="0.14em"
                        textTransform="uppercase"
                        color="ink.muted"
                        _hover={{ color: "ink.primary" }}
                    >
                        Explore the repository →
                    </Text>
                </MainContainer>
            </Box>
        </>
    );
}
