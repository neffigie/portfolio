"use client";

import theme from "chakra/theme";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";

/** The providers for the app. */
const Providers = ({ children }: { children: React.ReactNode }) => (
	<CacheProvider>
		<ChakraProvider theme={theme}>{children}</ChakraProvider>
	</CacheProvider>
);

export { Providers as default };
