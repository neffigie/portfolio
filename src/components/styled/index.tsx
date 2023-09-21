"use client";

import { Flex, HTMLChakraProps } from "@chakra-ui/react";

export const Sticky = ({ children, ...props }: HTMLChakraProps<"div">) => (
    <Flex as="header" position="fixed" backdropFilter="saturate(180%) blur(8px)" w="100%" justify="center" zIndex={999} {...props}>
        {children}
    </Flex>
);
