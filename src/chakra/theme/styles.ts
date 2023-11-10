"use client";

import { StyleFunctionProps } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

/**
 * The global styles.
 * @remarks See: https://chakra-ui.com/docs/styled-system/customize-theme#customizing-global-styles
 */
const styles = {
    global: (props: StyleFunctionProps) => ({
        body: {
            fontFamily: "body",
            color: mode("black", "whiteAlpha.900")(props),
            bgGradient: mode("linear(to-tl, brand.100, 10%, white)", "gray.800")(props),
            backgroundAttachment: "fixed",
            lineHeight: "base",
        },
    }),

    /**
     * System set initial value, and the app subscribes to system color mode changes.
     * See: https://chakra-ui.com/docs/styled-system/color-mode#common-configurations
     */
    initialColorMode: "system",
    useSystemColorMode: true,
};

export default styles;
