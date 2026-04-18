"use client";

import { Container, ContainerProps } from "@chakra-ui/react";

export default function MainContainer({ children, ...props }: ContainerProps) {
    return (
        <Container
            maxWidth={["100%", "100%", "container.xl"]}
            px={{ base: 6, md: 10, lg: 16 }}
            {...props}
        >
            {children}
        </Container>
    );
}
