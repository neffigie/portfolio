"use client";

import { Box, BoxProps } from "@chakra-ui/react";

/** Wraps the `children` in a box with absolutely position gradient backgrounds. */
export function GradientBackgroundBox({ children, ...props }: React.PropsWithChildren<BoxProps>) {
    return (
        <Box position="relative" {...props}>
            <Box
                position="absolute"
                opacity="50%"
                height="20%"
                width="20%"
                borderRadius="full"
                filter="blur(100px)"
                zIndex={-10}
                background="teal"
                top="22%"
                left="10%"
            />
            <Box
                position="absolute"
                opacity="50%"
                height="20%"
                width="20%"
                borderRadius="full"
                filter="blur(100px)"
                zIndex={-10}
                background="red"
                bottom="22%"
                right="10%"
            />
            {children}
        </Box>
    );
}
