"use client";

import { Center, Flex, Spacer, useColorMode } from "@chakra-ui/react";
import { Giscus, Image, Text, Tags, HTMLParser } from "components";
import { getUrl, convertPBDateToDate, Collections } from "pocketbase-lib";

export interface PostProps {
    /** The post. */
    post: Collections["posts"];
}

export function Post({ post }: PostProps) {
    const { colorMode } = useColorMode();
    return (
        <>
            <Image src={getUrl(post, post.image)} alt={post.image_alt} priority />
            <Text fontSize="6xl">{post.title}</Text>
            <Flex>
                <Center>
                    <Text fontSize="2xl">{post.description}</Text>
                </Center>
                <Spacer />
                <Center>
                    <Text fontSize="1xl">{convertPBDateToDate(post.date)}</Text>
                </Center>
            </Flex>
            <Tags tags={post.expand.categories} margin="2" />
            <hr />
            <HTMLParser body={post.body} colorMode={colorMode} />
            <Giscus colorMode={colorMode} />
        </>
    );
}
