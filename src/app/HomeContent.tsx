"use client";

import { Box, Flex, Grid, GridItem, Text } from "@chakra-ui/react";
import { FeedItem } from "components/feed";
import { FluidText } from "components/fluid-text";
import { MagneticText } from "components/magnetic";
import { TiltCard } from "components/tilt-card";
import Link from "next/link";
import Image from "next/image";
import { environment } from "../environment";

const CARD_TINTS = [
    "linear-gradient(135deg, #d8c4e0, #c4b8d8)",
    "linear-gradient(135deg, #c4dcc8, #a8c8b4)",
    "linear-gradient(135deg, #e8d4c0, #d8c0a8)",
];

function CardDecor({ index }: { index: number }) {
    if (index === 0) return (
        <svg viewBox="0 0 800 600" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.45 }} preserveAspectRatio="xMidYMid slice">
            <g stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" fill="none">
                <path d="M0,260 Q200,200 400,260 T800,260"/>
                <path d="M0,310 Q200,250 400,310 T800,310"/>
                <path d="M0,360 Q200,300 400,360 T800,360"/>
                <path d="M0,410 Q200,350 400,410 T800,410"/>
            </g>
            <circle cx="600" cy="180" r="90" fill="rgba(255,255,255,0.20)"/>
            <circle cx="600" cy="180" r="55" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1"/>
        </svg>
    );
    if (index === 1) return (
        <svg viewBox="0 0 600 400" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.45 }} preserveAspectRatio="xMidYMid slice">
            <g fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8">
                <circle cx="300" cy="200" r="35"/><circle cx="300" cy="200" r="65"/>
                <circle cx="300" cy="200" r="95"/><circle cx="300" cy="200" r="125"/>
            </g>
            <rect x="284" y="184" width="32" height="32" fill="rgba(255,255,255,0.25)" transform="rotate(45 300 200)"/>
        </svg>
    );
    return (
        <svg viewBox="0 0 600 400" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.45 }} preserveAspectRatio="xMidYMid slice">
            <g stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" fill="none">
                <path d="M0,80 L600,80"/><path d="M0,140 L600,140"/>
                <path d="M0,200 L600,200"/><path d="M0,260 L600,260"/>
                <path d="M0,320 L600,320"/>
            </g>
            <circle cx="180" cy="200" r="45" fill="rgba(255,255,255,0.22)"/>
            <circle cx="420" cy="200" r="45" fill="none" stroke="rgba(255,255,255,0.50)" strokeWidth="1"/>
        </svg>
    );
}

function ProjectCard({ item, index, big }: { item: FeedItem; index: number; big?: boolean }) {
    return (
        <TiltCard style={{ height: "100%", display: "block" }}>
            <Box
                as={Link}
                href={item.url}
                display="flex"
                flexDirection="column"
                height="100%"
                overflow="hidden"
                borderRadius="14px"
                background="rgba(255,252,248,0.55)"
                backdropFilter="blur(14px) saturate(130%)"
                sx={{ WebkitBackdropFilter: "blur(14px) saturate(130%)" }}
                border="2px solid rgba(255,255,255,0.80)"
                boxShadow="0 4px 20px rgba(180,160,170,0.18)"
                transition="transform 0.35s, box-shadow 0.35s"
                _hover={{ transform: "translateY(-2px)", boxShadow: "0 8px 32px rgba(180,160,190,0.25)" }}
                cursor="pointer"
            >
                <Box
                    position="relative"
                    flex={1}
                    minH={0}
                    background={CARD_TINTS[index % 3]}
                    overflow="hidden"
                >
                    {item.image_src && (
                        <Image
                            src={item.image_src}
                            alt={item.image_alt}
                            fill
                            sizes={big ? "(max-width: 768px) 100vw, 62vw" : "(max-width: 768px) 100vw, 38vw"}
                            loading="eager"
                            style={{ objectFit: "cover", opacity: 0.18, mixBlendMode: "overlay" }}
                        />
                    )}
                    <CardDecor index={index} />
                    <Text
                        position="absolute"
                        top={3}
                        left={3}
                        fontFamily="mono"
                        fontSize="9px"
                        letterSpacing="0.18em"
                        color="rgba(255,255,255,0.85)"
                    >
                        / 0{index + 1}
                    </Text>
                </Box>

                <Box
                    px={3}
                    py="10px"
                    flexShrink={0}
                    background="rgba(255,255,255,0.60)"
                    borderTop="1px solid rgba(255,255,255,0.50)"
                >
                    <Text
                        fontFamily="mono"
                        fontSize="8px"
                        letterSpacing="0.18em"
                        textTransform="uppercase"
                        color="ink.faint"
                        mb="2px"
                    >
                        {item.tags[0]?.name}
                    </Text>
                    <Text
                        fontFamily="heading"
                        fontStyle="italic"
                        fontWeight="400"
                        fontSize={big ? "15px" : "14px"}
                        color="ink.primary"
                        lineHeight="1.25"
                    >
                        {item.title}
                    </Text>
                </Box>
            </Box>
        </TiltCard>
    );
}

export function HomeContent({ featured, resumeUrl }: { featured: FeedItem[]; resumeUrl: string }) {
    const author = environment.NEXT_PUBLIC_METADATA_AUTHOR.replace(/['"]+/g, "");

    return (
        <Flex
            direction="column"
            height="calc(100dvh - 104px)"
            overflow="hidden"
            position="relative"
            zIndex={1}
        >
            {/* ── Hero ───────────────────────────────────────────── */}
            <Flex
                as="section"
                flexShrink={0}
                px={{ base: 6, md: 10 }}
                py="14px"
                align="center"
                gap={8}
            >
                {/* Left: eyebrow + headline */}
                <Box flexShrink={0}>
                    <Flex align="center" gap="10px" mb="6px">
                        <Box w="24px" h="1px" bg="ink.faint" flexShrink={0} />
                        <Text
                            fontFamily="mono"
                            fontSize="9px"
                            letterSpacing="0.22em"
                            textTransform="uppercase"
                            color="ink.faint"
                            whiteSpace="nowrap"
                        >
                            <MagneticText>The portfolio of Anna Noelle</MagneticText>
                        </Text>
                    </Flex>
                    <Text
                        as="h1"
                        fontFamily="heading"
                        fontStyle="italic"
                        fontWeight="300"
                        fontSize="clamp(36px, 4.5vw, 64px)"
                        lineHeight="0.9"
                        letterSpacing="-0.03em"
                        display="inline-block"
                    >
                        <FluidText gradient>{author}</FluidText>
                        <Box as="span" color="accent.primary">.</Box>
                    </Text>
                </Box>

                {/* Right: lede + resume pill — plain CSS, no LiquidGlass */}
                <Flex direction="column" align="flex-start" gap={2}>
                    <Text
                        fontFamily="heading"
                        fontStyle="italic"
                        fontWeight="300"
                        fontSize="14px"
                        lineHeight="1.5"
                        color="ink.primary"
                        whiteSpace="nowrap"
                    >
                        Full-stack engineer, game developer, creative builder.
                    </Text>
                    <Box
                        as={Link}
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        display="inline-flex"
                        alignItems="center"
                        gap={2}
                        px="20px"
                        py="10px"
                        borderRadius="999px"
                        fontFamily="mono"
                        fontSize="10px"
                        letterSpacing="0.12em"
                        textTransform="uppercase"
                        color="ink.primary"
                        background="linear-gradient(135deg, rgba(222,168,176,0.35), rgba(184,212,232,0.35))"
                        backdropFilter="blur(12px)"
                        sx={{ WebkitBackdropFilter: "blur(12px)" }}
                        border="1px solid rgba(222,168,176,0.50)"
                        boxShadow="0 2px 12px rgba(180,160,170,0.18)"
                        transition="all 0.3s"
                        _hover={{
                            background: "rgba(255,255,255,0.75)",
                            transform: "translateY(-1px)",
                            boxShadow: "0 6px 20px rgba(180,160,170,0.18)",
                        }}
                    >
                        View Résumé →
                    </Box>
                </Flex>
            </Flex>

            {/* ── Work ───────────────────────────────────────────── */}
            {featured.length > 0 && (
                <Flex
                    as="section"
                    direction="column"
                    flex={1}
                    minH={0}
                    px={{ base: 6, md: 10 }}
                    pb="12px"
                >
                    <Flex justifyContent="space-between" alignItems="baseline" mb={2} flexShrink={0}>
                        <Text
                            fontFamily="heading"
                            fontStyle="italic"
                            fontWeight="400"
                            fontSize="17px"
                            color="ink.primary"
                        >
                            Selected Work
                        </Text>
                        <Text
                            as={Link}
                            href="/projects"
                            fontFamily="mono"
                            fontSize="9px"
                            letterSpacing="0.14em"
                            textTransform="uppercase"
                            color="ink.faint"
                            _hover={{ color: "ink.primary" }}
                        >
                            View all work →
                        </Text>
                    </Flex>

                    <Grid
                        templateColumns="5fr 3fr"
                        templateRows="1fr 1fr"
                        gap="10px"
                        flex={1}
                        minH={0}
                    >
                        {featured[0] && (
                            <GridItem rowSpan={2} minH={0}>
                                <ProjectCard item={featured[0]} index={0} big />
                            </GridItem>
                        )}
                        {featured[1] && (
                            <GridItem minH={0}>
                                <ProjectCard item={featured[1]} index={1} />
                            </GridItem>
                        )}
                        {featured[2] && (
                            <GridItem minH={0}>
                                <ProjectCard item={featured[2]} index={2} />
                            </GridItem>
                        )}
                    </Grid>
                </Flex>
            )}
        </Flex>
    );
}
