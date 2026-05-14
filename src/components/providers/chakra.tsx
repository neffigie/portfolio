"use client";

import theme from "theme";
import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";

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
