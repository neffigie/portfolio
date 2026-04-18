"use client";

import { Flex, Spinner } from "@chakra-ui/react";

export default function Loading() {
    return (
        <Flex minH="calc(100vh - 64px)" align="center" justify="center">
            <Spinner
                color="brand.400"
                emptyColor="rgba(42, 108, 92, 0.12)"
                size="lg"
                thickness="4px"
                speed="0.9s"
            />
        </Flex>
    );
}
