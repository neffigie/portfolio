"use client";

import { Center, Flex, Spacer, useColorMode } from "@chakra-ui/react";
import { Giscus, Image, Text, Tags, HTMLParser } from "components";
import { Post } from "config/database";

export interface PostProps {
    /** The post. */
    post: Post;
}

export function Post({ post }: PostProps) {
    const { colorMode } = useColorMode();
    return (
        <>
            <Image src={post.image_src} alt={post.image_alt} priority />
            <Text fontSize="6xl">{post.title}</Text>
            <Flex>
                <Center>
                    <Text fontSize="2xl">{post.description}</Text>
                </Center>
                <Spacer />
                <Center>
                    <Text fontSize="1xl">{post.date}</Text>
                </Center>
            </Flex>
            <Tags tags={post.tags} margin="2" />
            <hr />
            <HTMLParser body={post.body} colorMode={colorMode} />
            <Giscus colorMode={colorMode} />
        </>
    );
}
