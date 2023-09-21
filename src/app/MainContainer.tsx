"use client";

import { Box, Container } from "@chakra-ui/react";

export function MainContainer({ children }: React.PropsWithChildren) {
    return (
        <Container maxWidth="4xl" centerContent as="main">
            <Box padding="2" mt={10}>
                {children}
            </Box>
        </Container>
    );
}
