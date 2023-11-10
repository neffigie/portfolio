"use client";

import { Alert, AlertIcon, Box, Divider, Spacer, Wrap, WrapItem, useColorMode } from "@chakra-ui/react";
import { Giscus, Image, ClientText, Tags, HTMLParser, ClientHeading } from "components";
import { Post } from "config";

export interface PostProps {
    /** The post. */
    post: Post;
}

export function Post({ post }: PostProps) {
    const { colorMode } = useColorMode();
    return (
        <Box backgroundColor="whiteAlpha.50">
            <ClientHeading fontSize="3xl" color="brand.800">
                {post.title}
            </ClientHeading>
            <Image src={post.image_src} alt={post.image_alt} priority />
            <Wrap align="end">
                <WrapItem flexGrow={1}>
                    <ClientText fontSize="xl">{post.description}</ClientText>
                </WrapItem>
                <WrapItem>
                    <ClientText fontSize="md" as="i">
                        {post.date}
                    </ClientText>
                </WrapItem>
            </Wrap>
            <Tags tags={post.tags} mt={2} />
            {post.showWarning && (
                <Alert status="warning" variant="top-accent" mt={2}>
                    <AlertIcon />
                    This post is legacy; it may reflect a point where my skill-set was developing or contains outdated
                    information. Enjoy reading nonethless!
                </Alert>
            )}
            <Divider mt={4} />
            <HTMLParser body={post.body} colorMode={colorMode} />
            <Giscus colorMode={colorMode} />
        </Box>
    );
}
