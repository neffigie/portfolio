"use client";

import { Flex, Spinner } from "@chakra-ui/react";

export default function Loading() {
    return (
        <Flex minH="calc(100dvh - 104px)" align="center" justify="center">
            <Spinner
                color="accent.400"
                emptyColor="rgba(232,212,218,0.32)"
                size="lg"
                thickness="4px"
                speed="0.9s"
            />
        </Flex>
    );
}
