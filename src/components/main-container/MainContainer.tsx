"use client";

import { Container, ContainerProps } from "@chakra-ui/react";

export default function MainContainer({ children, ...props }: ContainerProps) {
    return (
        <Container
            maxWidth="4xl"
            as="main"
            padding="2"
            mt={14}
            alignContent="center"
            flex={1}
            height="100%"
            display="table"
            {...props}
        >
            {children}
        </Container>
    );
}
