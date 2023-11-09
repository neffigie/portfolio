"use client";

import { StyleFunctionProps } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

/**
 * The global styles.
 * @remarks See: https://chakra-ui.com/docs/styled-system/customize-theme#customizing-global-styles
 */
// TODO - these styles are actually not being applied...
const styles = {
    global: (props: StyleFunctionProps) => ({
        body: {
            fontFamily: "body",
            color: mode("gray.800", "whiteAlpha.900")(props),
            bg: "linear(to-tl, teal.200, white)",
            lineHeight: "base",
        },
    }),
};

export default styles;
