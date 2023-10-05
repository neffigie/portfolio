"use client";

import { Container, ContainerProps } from "@chakra-ui/react";

export default function MainContainer({ children, ...props }: ContainerProps) {
    return (
        <Container width="80vw" alignContent="center" p={0} height="100%" display="table" {...props}>
            {children}
        </Container>
    );
}
