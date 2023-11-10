"use client";

import { Alert, AlertIcon, Box, Divider, Wrap, WrapItem } from "@chakra-ui/react";
import { Giscus, Image, ClientText, Tags, HTMLParser, ClientHeading } from "components";
import { Post } from "config";

export interface PostProps {
    /** The post. */
    post: Post;
}

export function Post({ post }: PostProps) {
    return (
        <Box backgroundColor="whiteAlpha.600" padding={8} borderRadius={32}>
            <ClientHeading size="xl" color="brand.700">
                {post.title}
            </ClientHeading>
            <Image src={post.image_src} alt={post.image_alt} priority />
            <Wrap align="end" mt={2}>
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
            {post.note.length > 0 && (
                <Alert status="warning" variant="top-accent" mt={2}>
                    <AlertIcon />
                    {post.note}
                </Alert>
            )}
            <Box marginTop={8}>
                <HTMLParser body={post.body} />
            </Box>
            <Giscus />
        </Box>
    );
}
