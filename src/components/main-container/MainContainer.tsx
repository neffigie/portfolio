"use client";

import { Container, ContainerProps } from "@chakra-ui/react";

export default function MainContainer({ children, ...props }: ContainerProps) {
    return (
        <Container
            maxWidth="2xl"
            as="main"
            mt={24}
            alignContent="center"
            flex={1}
            p={0}
            height="100%"
            display="table"
            {...props}
        >
            {children}
        </Container>
    );
}
