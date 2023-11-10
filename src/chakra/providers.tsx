"use client";

import theme from "chakra/theme";
import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";

/** The providers for the app. */
export default function Providers({ children }: React.PropsWithChildren) {
    return (
        <>
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />
            <CacheProvider>
                <ChakraProvider theme={theme}>{children}</ChakraProvider>
            </CacheProvider>
        </>
    );
}
