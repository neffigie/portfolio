"use client";

import { Flex, Spinner } from "@chakra-ui/react";

export default function Loading() {
    return (
        <Flex minH="calc(100dvh - 104px)" align="center" justify="center">
            <Spinner
                color="accent.400"
                emptyColor="rgba(235,184,194,0.2)"
                size="lg"
                thickness="4px"
                speed="0.9s"
            />
        </Flex>
    );
}
