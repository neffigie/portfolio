"use client";

import { Box, Text } from "@chakra-ui/react";
import { MainContainer } from "components/main-container";
import Link from "next/link";

export default function NotFound() {
    return (
        <Box as="section" bg="surface.bright" py={{ base: 32, md: 48 }}>
            <MainContainer>
                <Text
                    fontSize="10px"
                    letterSpacing="0.14em"
                    textTransform="uppercase"
                    color="ink.faint"
                    fontFamily="heading"
                    mb={4}
                >
                    404
                </Text>
                <Text
                    fontFamily="heading"
                    fontStyle="italic"
                    fontSize={{ base: "5xl", md: "7xl" }}
                    lineHeight="0.92"
                    letterSpacing="-0.02em"
                    color="ink.primary"
                    mb={6}
                >
                    Page not found.
                </Text>
                <Text fontSize="sm" color="ink.muted" mb={10}>
                    The page you are looking for does not exist or has been moved.
                </Text>
                <Text
                    as={Link}
                    href="/"
                    fontSize="10px"
                    letterSpacing="0.12em"
                    textTransform="uppercase"
                    color="ink.muted"
                    _hover={{ color: "ink.primary" }}
                >
                    ← Return home
                </Text>
            </MainContainer>
        </Box>
    );
}
