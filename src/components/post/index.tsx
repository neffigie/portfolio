"use client";

import { Alert, AlertIcon, Divider, Spacer, Wrap, WrapItem, useColorMode } from "@chakra-ui/react";
import { Giscus, Image, Text, Tags, HTMLParser } from "components";
import { Post } from "config";

export interface PostProps {
    /** The post. */
    post: Post;
}

export function Post({ post }: PostProps) {
    const { colorMode } = useColorMode();
    return (
        <>
            <Image src={post.image_src} alt={post.image_alt} priority />
            <Text fontSize="3xl">{post.title}</Text>
            <Wrap>
                <WrapItem flexGrow={1}>
                    <Text fontSize="xl">{post.description}</Text>
                </WrapItem>
                <WrapItem>
                    <Text fontSize="xl" as="i">
                        {post.date}
                    </Text>
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
        </>
    );
}
