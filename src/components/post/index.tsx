"use client";

import { Alert, AlertIcon, Box, Flex, Text } from "@chakra-ui/react";
import { Giscus, Image, Tags, HTMLParser } from "components";
import { MainContainer } from "components/main-container";
import { Post } from "config";

export interface PostProps {
    /** The post. */
    post: Post;
}

export function Post({ post }: PostProps) {
    return (
        <Box as="section" py={{ base: 12, md: 20 }}>
            <MainContainer>
            <Box
                mx="auto"
                sx={{ background: "linear-gradient(135deg, rgba(255,255,255,0.78), rgba(241,244,243,0.52))" }}
                backdropFilter="blur(16px)"
                border="1px solid"
                borderColor="surface.containerHighest"
                borderRadius="xl"
                p={{ base: 6, md: 10 }}
            >
            {/* Header */}
            <Box mb={8}>
                <Text
                    fontSize="10px"
                    letterSpacing="0.14em"
                    textTransform="uppercase"
                    color="ink.muted"
                    fontFamily="heading"
                    mb={4}
                >
                    {post.date}
                </Text>
                <Text
                    as="h1"
                    fontFamily="heading"
                    fontStyle="italic"
                    fontSize={{ base: "4xl", md: "5xl" }}
                    lineHeight="1.05"
                    letterSpacing="-0.02em"
                    color="ink.primary"
                    mb={4}
                >
                    {post.title}
                </Text>
                <Text fontFamily="body" fontSize="md" color="ink.muted" lineHeight="1.7" mb={4}>
                    {post.description}
                </Text>
                <Tags tags={post.tags} />
            </Box>

            {/* Hero image */}
            <Box mb={8}>
                <Image src={post.image_src} alt={post.image_alt} priority />
            </Box>

            {/* Note / disclaimer */}
            {post.note.length > 0 && (
                <Alert status="warning" variant="left-accent" mb={8} borderRadius="md">
                    <AlertIcon />
                    {post.note}
                </Alert>
            )}

            {/* Body */}
            <Box sx={{ img: { display: "block", mx: "auto" } }}>
                <HTMLParser body={post.body} />
            </Box>

            {/* Comments */}
            <Box mt={16} pt={12} borderTop="1px solid" borderColor="surface.containerHighest">
                <Text
                    fontSize="10px"
                    letterSpacing="0.14em"
                    textTransform="uppercase"
                    color="ink.muted"
                    mb={6}
                >
                    Discussion
                </Text>
                <Giscus />
            </Box>
            </Box>
            </MainContainer>
        </Box>
    );
}
