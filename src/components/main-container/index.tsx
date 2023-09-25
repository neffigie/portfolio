"use client";

import { Container, ContainerProps } from "@chakra-ui/react";

export function MainContainer({ children, ...props }: ContainerProps) {
    return (
        <Container maxWidth="4xl" as="main" padding="2" mt={14} alignContent="center" {...props}>
            {children}
        </Container>
    );
}
