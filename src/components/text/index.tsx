"use client";

import { Text as ChakraText, TextProps, Heading as ChakraHeading, HeadingProps } from "@chakra-ui/react";

/** The chakra-ui `Text` component wrapped in a `"use client"` directive. */
export const Text = ({ children, ...props }: TextProps) => <ChakraText {...props}>{children}</ChakraText>;

/** The chakra-ui `Heading` component wrapped in a `"use client"` directive. */
export const Heading = ({ children, ...props }: HeadingProps) => <ChakraHeading {...props}>{children}</ChakraHeading>;
