"use client";

import { Box, type BoxProps } from "@chakra-ui/react";

export default function MainContainer({ children, ...props }: BoxProps) {
    return (
        <Box
            w="100%"
            maxW="1280px"
            mx="auto"
            px={{ base: 6, md: 10, lg: 16 }}
            {...props}
        >
            {children}
        </Box>
    );
}
