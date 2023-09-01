"use client";

import { Text as ChakraText, TextProps } from "@chakra-ui/react";

/** The chakra-ui `Text` component with no additional changes wrapped in a `"use client"` directive. */
export function Text({ children, ...props }: TextProps) {
	return <ChakraText {...props}>{children}</ChakraText>;
}
